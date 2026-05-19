import { api } from "../../interceptors/authInterceptor";
import type { AuthData } from "../../models/Auth/authData";
import type { LoginResponse } from "../../models/Auth/loginResponse";
import type { User } from "../../models/uml/User";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";
import type { StorageProvider } from "../../storage/StorageProvider";
import type { FirebaseUserInfo } from "../../models/interfaces/FirebaseUserInfo";
import type { SessionProfile } from "../../models/interfaces/SessionProfile";
import type { EmailSignUpData } from "../../models/interfaces/EmailSignUpData";
import type { RegisterAdminPayload } from "../../models/interfaces/RegisterAdminPayload";

// Payload confirmado con la colección Postman del backend:
// POST /api/auth/register-admin → { email, password, code, first_name, last_name }

const isUnauthorizedError = (error: unknown): boolean =>
    (error as { response?: { status?: number } }).response?.status === 401;

// El backend devuelve 400 con { message: "email already exists" }
// cuando intentamos registrar un usuario que ya existe.
const isEmailAlreadyExistsError = (error: unknown): boolean => {
    const err = error as { response?: { status?: number; data?: { message?: string } } };
    if (err.response?.status === 409) return true;
    if (err.response?.status === 400) {
        const msg = err.response?.data?.message ?? "";
        return msg.toLowerCase().includes("email") && msg.toLowerCase().includes("exist");
    }
    return false;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const getStableHash = (value: string): string => {
    let hash = 0;
    for (const char of value) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    return hash.toString(36).toUpperCase();
};

// Contraseña generada cumple la política del backend: mayúscula + minúscula + número + especial
const getSocialPassword = (email: string): string =>
    `Social123*${getStableHash(normalizeEmail(email))}`;

const getLegacySocialPassword = (email: string): string => {
    const localPart = normalizeEmail(email).split("@")[0];
    return `Social@1-${localPart}`;
};

// Código único y determinista por email
const getAdminCode = (email: string): string =>
    `ADM-${getStableHash(normalizeEmail(email)).slice(0, 8)}`;

class SecurityService {
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        this.storage = storage;
    }

    async login(email: string, password: string, profile?: SessionProfile): Promise<User> {
        const response = await api.post<LoginResponse>("/auth/login", { email, password });
        return this.persistSession(response.data.data, profile);
    }

    async loginWithFirebase(firebaseUser: FirebaseUserInfo): Promise<User> {
        const { uid, email, displayName, photoURL } = firebaseUser;
        const profile = { displayName, photoURL };
        const passwords = this.getSocialPasswordCandidates({ email, uid });

        // Paso 1: intentar login con todas las contraseñas candidatas
        try {
            return await this.loginWithPasswordCandidates({ email, passwords, profile });
        } catch (loginError) {
            if (!isUnauthorizedError(loginError)) throw loginError;
        }

        // Paso 2: login falló con 401 → intentar registrar
        try {
            await this.registerSocialUser({ email, password: passwords[0], displayName });
        } catch (registerError) {
            // Si el email ya existe en el backend (registro parcial previo),
            // NO lanzar error — simplemente continuar e intentar login de nuevo
            // con todas las contraseñas candidatas.
            if (!isEmailAlreadyExistsError(registerError)) throw registerError;
        }

        // Paso 3: login final (sea que registramos ahora o ya existía)
        // Si el usuario fue creado en un intento previo con una contraseña
        // que no conocemos, este login fallará con 401 y el catch mostrará
        // "No fue posible validar tus credenciales" — que es el comportamiento correcto.
        return await this.loginWithPasswordCandidates({ email, passwords, profile });
    }

    async signUpWithEmailPassword({
        fullName,
        email,
        password,
    }: EmailSignUpData): Promise<User> {
        const { firstName, lastName } = this.splitFullName(fullName);
        await this.registerAdmin({ email, password, firstName, lastName });
        return await this.login(email, password, { displayName: fullName });
    }

    logout(): void {
        this.storage.removeItem("user");
        this.storage.removeItem("access_token");
        this.storage.removeItem("token_type");
    }

    getStoredUser(): User | null {
        const stored = this.storage.getItem("user");
        if (!stored) return null;
        try { return JSON.parse(stored); }
        catch { return null; }
    }

    isAuthenticated(): boolean {
        return !!this.storage.getItem("access_token");
    }

    // ─── Privados ────────────────────────────────────────────────

    private persistSession(authData: AuthData, profile?: SessionProfile): User {
        const { user, access_token, token_type } = authData;
        const sessionUser = this.enrichUser(user, profile);
        this.storage.setItem("user", JSON.stringify(sessionUser));
        this.storage.setItem("access_token", access_token);
        this.storage.setItem("token_type", token_type);
        return sessionUser;
    }

    private enrichUser(user: User, profile?: SessionProfile): User {
        if (!profile) return user;
        return {
            ...user,
            display_name: profile.displayName ?? user.display_name,
            photo_url: profile.photoURL ?? user.photo_url,
        };
    }

    private async registerSocialUser({
        email,
        password,
        displayName,
    }: {
        email: string;
        password: string;
        displayName: string | null;
    }): Promise<void> {
        const { firstName, lastName } = this.splitFullName(
            displayName ?? email.split("@")[0]
        );
        await this.registerAdmin({ email, password, firstName, lastName });
    }

    private getSocialPasswordCandidates({
        email,
        uid,
    }: {
        email: string;
        uid: string;
    }): string[] {
        return Array.from(
            new Set([
                getSocialPassword(email),
                getLegacySocialPassword(email),
                uid,
            ])
        );
    }

    private async loginWithPasswordCandidates({
        email,
        passwords,
        profile,
    }: {
        email: string;
        passwords: string[];
        profile: SessionProfile;
    }): Promise<User> {
        let lastError: unknown = null;
        for (const password of passwords) {
            try {
                return await this.login(email, password, profile);
            } catch (error) {
                if (!isUnauthorizedError(error)) throw error;
                lastError = error;
            }
        }
        throw lastError;
    }

    private async registerAdmin({
        email,
        password,
        firstName,
        lastName,
    }: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<void> {
        const payload: RegisterAdminPayload = {
            email,
            password,
            code: getAdminCode(email),
            first_name: firstName,
            last_name: lastName,
        };
        await api.post("/auth/register-admin", payload);
    }

    private splitFullName(fullName: string): { firstName: string; lastName: string } {
        const parts = fullName.trim().split(/\s+/).filter(Boolean);
        return {
            firstName: parts[0] ?? "Usuario",
            lastName: parts.slice(1).join(" ") || "Social",
        };
    }
}

export const securityService = new SecurityService();