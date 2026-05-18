import { api } from "../../interceptors/authInterceptor";
import type { AuthData } from "../../models/auth/authData";
import type { LoginResponse } from "../../models/auth/loginResponse";
import type { User } from "../../models/User";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";
import type { StorageProvider } from "../../storage/StorageProvider";
import type { FirebaseUserInfo } from "./firebaseAuthService";

interface SessionProfile {
    displayName?: string | null;
    photoURL?: string | null;
}

export interface EmailSignUpData {
    fullName: string;
    email: string;
    password: string;
}

const getSocialPassword = (uid: string): string => `SOCIAL-${uid}`;

class SecurityService {
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        this.storage = storage;
    }

    private persistSession(authData: AuthData, profile?: SessionProfile): User {
        const { user, access_token, token_type } = authData;

        const sessionUser: User = {
            ...user,
            ...(profile?.displayName ? { display_name: profile.displayName } : {}),
            ...(profile?.photoURL ? { photo_url: profile.photoURL } : {}),
        };

        this.storage.setItem("user", JSON.stringify(sessionUser));
        this.storage.setItem("access_token", access_token);
        this.storage.setItem("token_type", token_type);

        return sessionUser;
    }

    // ✅ URL corregida
    async login(email: string, password: string, profile?: SessionProfile): Promise<User> {
        const response = await api.post<LoginResponse>("/auth/login", { email, password });
        return this.persistSession(response.data.data, profile);
    }

    // ✅ Flujo social simplificado:
    // 1. Busca el usuario por email en el backend
    // 2. Si existe → hace login con contraseña social (uid de Firebase)
    // 3. Si no existe → lanza error claro
    private async findUserByEmail(email: string): Promise<User | null> {
        try {
            const searchResponse = await api.get<{ data: User[] }>(
                `/users/search?email=${encodeURIComponent(email)}`
            );
            const users = searchResponse.data?.data;
            if (!Array.isArray(users) || users.length === 0) return null;
            return users[0];
        } catch (error) {
            console.error("Error buscando usuario:", error);
            return null;
        }
    }

    async loginWithFirebase(firebaseUser: FirebaseUserInfo): Promise<User> {
        const { uid, email, displayName, photoURL } = firebaseUser;
        const profile = { displayName, photoURL };
        const password = getSocialPassword(uid);

        const found = await this.findUserByEmail(email);
        if (!found) {
            throw new Error("USUARIO_NO_REGISTRADO");
        }
        if (!found.is_active) {
            throw new Error("USUARIO_INACTIVO");
        }

        try {
            return await this.login(email, password, profile);
        } catch {
            throw new Error("CONTRASEÑA_INCOMPATIBLE");
        }
    }

    async registerWithFirebase(firebaseUser: FirebaseUserInfo): Promise<User> {
        const { uid, email, displayName, photoURL, provider, oauthAccessToken } = firebaseUser;
        const profile = { displayName, photoURL };
        const password = getSocialPassword(uid);

        const existingUser = await this.findUserByEmail(email);
        if (existingUser) {
            if (!existingUser.is_active) {
                throw new Error("USUARIO_INACTIVO");
            }
            throw new Error("USUARIO_YA_EXISTE");
        }

        const payload = {
            email,
            password,
            provider,
            providerId: provider === "google" ? "google.com" : provider === "microsoft" ? "microsoft.com" : "github.com",
            localId: uid,
            fullName: displayName ?? "",
            displayName,
            photoUrl: photoURL,
            oauthAccessToken: oauthAccessToken ?? null,
            emailVerified: false,
        };

        const response = await api.post<LoginResponse>("/auth/register-admin", payload);
        return this.persistSession(response.data.data, profile);
    }

    async signUpWithEmailPassword({ fullName, email, password }: EmailSignUpData): Promise<User> {
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] ?? "Usuario";
        const lastName = nameParts.slice(1).join(" ") || "Nuevo";
        const code = `STD-${email.split("@")[0].slice(0, 6).toUpperCase()}`;

        // ✅ URL corregida con el endpoint real
        await api.post("/users/", {
            email,
            password,
            code,
            role: "STUDENT",
            first_name: firstName,
            last_name: lastName,
            identification: "",
        });

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
}

export const securityService = new SecurityService();