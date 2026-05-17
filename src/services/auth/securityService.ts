import { api } from "../../interceptors/authInterceptor";
import type { AuthData } from "../../models/Auth/authData";
import type { LoginResponse } from "../../models/Auth/loginResponse";
import type { User } from "../../models/User";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";
import type { StorageProvider } from "../../storage/StorageProvider";
import type { SocialAuthProvider } from "./firebaseAuthService";

// Información mínima que Firebase nos da del usuario autenticado
export interface FirebaseUserInfo {
    uid: string;
    email: string;
    displayName: string | null;
    provider: SocialAuthProvider;
}

class SecurityService {
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        this.storage = storage;
    }

    private persistSession(authData: AuthData): User {
        const { user, access_token, token_type } = authData;
        this.storage.setItem("user", JSON.stringify(user));
        this.storage.setItem("access_token", access_token);
        this.storage.setItem("token_type", token_type);
        return user;
    }

    async login(email: string, password: string): Promise<User> {
        const response = await api.post<LoginResponse>("/auth/login", {
            email,
            password,
        });
        return this.persistSession(response.data.data);
    }

    // Flujo social: usa el uid de Firebase como contraseña.
    // Si el usuario no existe en el backend, lo registra automáticamente y reintenta.
    async loginWithFirebase(firebaseUser: FirebaseUserInfo): Promise<User> {
        const { uid, email, displayName } = firebaseUser;

        // El uid de Firebase es único por usuario — lo usamos como contraseña
        // determinista sin necesidad de almacenarlo en ningún lado.
        const password = uid;

        try {
            // Intento 1: el usuario ya existe, login directo
            return await this.login(email, password);
        } catch {
            // El usuario no existe aún — lo registramos y reintentamos
            await this.registerSocialUser({ email, password, displayName });
            return await this.login(email, password);
        }
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
