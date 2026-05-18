import { api } from "../../interceptors/authInterceptor";
import type { AuthData } from "../../models/auth/authData";
import type { LoginResponse } from "../../models/auth/loginResponse";
import type { User } from "../../models/User";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";
import type { StorageProvider } from "../../storage/StorageProvider";
import type { SocialAuthProvider } from "./firebaseAuthService";

// Información mínima que Firebase nos da del usuario autenticado
export interface FirebaseUserInfo {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    provider: SocialAuthProvider;
}

interface SessionProfile {
    displayName?: string | null;
    photoURL?: string | null;
}

export interface EmailSignUpData {
    fullName: string;
    email: string;
    password: string;
}

const isUnauthorizedError = (error: unknown): boolean =>
    (error as { response?: { status?: number } }).response?.status === 401;

const getSocialPassword = (email: string): string =>
    `SOCIAL-${email.trim().toLowerCase()}`;

class SecurityService {
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        this.storage = storage;
    }

    private enrichUser(user: User, profile?: SessionProfile): User {
        if (!profile) return user;

        return {
            ...user,
            display_name: profile.displayName ?? user.display_name,
            photo_url: profile.photoURL ?? user.photo_url,
        };
    }

    private persistSession(authData: AuthData, profile?: SessionProfile): User {
        const { user, access_token, token_type } = authData;
        const sessionUser = this.enrichUser(user, profile);
        this.storage.setItem("user", JSON.stringify(sessionUser));
        this.storage.setItem("access_token", access_token);
        this.storage.setItem("token_type", token_type);
        return sessionUser;
    }

    async login(email: string, password: string, profile?: SessionProfile): Promise<User> {
        const response = await api.post<LoginResponse>("/auth/login", {
            email,
            password,
        });
        return this.persistSession(response.data.data, profile);
    }

    // Flujo social: usa el uid de Firebase como contraseña.
    // Si el usuario no existe en el backend, lo registra automáticamente y reintenta.
    async loginWithFirebase(firebaseUser: FirebaseUserInfo): Promise<User> {
        const { uid, email, displayName, photoURL } = firebaseUser;
        const profile = { displayName, photoURL };

        // El uid de Firebase es único por usuario — lo usamos como contraseña
        // determinista sin necesidad de almacenarlo en ningún lado.
        const password = getSocialPassword(email);

        try {
            // Intento 1: el usuario ya existe, login directo
            return await this.login(email, password, profile);
        } catch (error) {
            if (!isUnauthorizedError(error)) {
                throw error;
            }

            // El usuario no existe aún — lo registramos y reintentamos
            try {
                await this.registerSocialUser({ email, password, displayName });
                return await this.login(email, password, profile);
            } catch (registerError) {
                if (!isUnauthorizedError(registerError)) {
                    return await this.login(email, uid, profile);
                }

                throw registerError;
            }
        }
    }

    async signUpWithEmailPassword({
        fullName,
        email,
        password,
    }: EmailSignUpData): Promise<User> {
        await this.registerBasicUser({ email, password, fullName });
        return await this.login(email, password, { displayName: fullName });
    }

    // Registra el usuario via /auth/register-admin (endpoint público del backend).
    // Body requerido: email, password, code, first_name, last_name
    private async registerSocialUser({
        email,
        password,
        displayName,
    }: {
        email: string;
        password: string;
        displayName: string | null;
    }): Promise<void> {
        const nameParts = (displayName ?? email.split("@")[0]).split(" ");
        const firstName = nameParts[0] ?? "Usuario";
        const lastName = nameParts.slice(1).join(" ") || "Social";
        const code = `ADM-${email.split("@")[0].slice(0, 6).toUpperCase()}`;

        await api.post("/auth/register-admin", {
            email,
            password,
            code,
            first_name: firstName,
            last_name: lastName,
        });
    }

    private async registerBasicUser({
        email,
        password,
        fullName,
    }: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<void> {
        const { firstName, lastName } = this.splitFullName(fullName);
        const code = `ADM-${email.split("@")[0].slice(0, 6).toUpperCase()}`;

        await api.post("/auth/register-admin", {
            email,
            password,
            code,
            first_name: firstName,
            last_name: lastName,
        });
    }

    private splitFullName(fullName: string): { firstName: string; lastName: string } {
        const nameParts = fullName.trim().split(/\s+/);
        return {
            firstName: nameParts[0] ?? "Usuario",
            lastName: nameParts.slice(1).join(" ") || "Nuevo",
        };
    }

    logout(): void {
        this.storage.removeItem("user");
        this.storage.removeItem("access_token");
        this.storage.removeItem("token_type");
    }

    getStoredUser(): User | null {
        const stored = this.storage.getItem("user");
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }

    isAuthenticated(): boolean {
        return !!this.storage.getItem("access_token");
    }
}

export const securityService = new SecurityService();
