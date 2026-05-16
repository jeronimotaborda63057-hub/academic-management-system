import { api } from "../../interceptors/authInterceptor";
import type { LoginResponse } from "../../models/Auth/loginResponse";
import type { User } from "../../models/User";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";
import type { StorageProvider } from "../../storage/StorageProvider";

class SecurityService {
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        this.storage = storage;
    }

    async login(email: string, password: string): Promise<User> {
        const response = await api.post<LoginResponse>("/api/auth/login/", {
            email,
            password,
        });

        const { user, access_token, token_type } = response.data.data;

        // ✅ Guarda en localStorage
        this.storage.setItem("user", JSON.stringify(user));
        this.storage.setItem("access_token", access_token);
        this.storage.setItem("token_type", token_type);

        return user;
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
