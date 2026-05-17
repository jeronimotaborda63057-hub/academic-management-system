import { api } from "../../interceptors/authInterceptor";
import type { AuthData } from "../../models/auth/authData";
import type { LoginResponse } from "../../models/auth/loginResponse";
import type { User } from "../../models/User";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";
import type { StorageProvider } from "../../storage/StorageProvider";
import type { SocialAuthProvider } from "./firebaseAuthService";

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

    async loginWithFirebaseToken(
        idToken: string,
        provider: SocialAuthProvider
    ): Promise<User> {
        const response = await api.post<LoginResponse>("/auth/login", {
            id_token: idToken,
            provider,
        });

        return this.persistSession(response.data.data);
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
