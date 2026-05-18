import { api } from "../interceptors/authInterceptor";
import type { CreateUserPayload, User } from "../models/User";
import type { UserFilters } from "../models/UserFilters";
import { BaseService } from "./baseService";

export class UserService extends BaseService<User> {
    constructor() {
        super("/users");
    }

    async createUser(payload: CreateUserPayload): Promise<User | null> {
        try {
            const response = await api.post<{ data: User }>(this.apiURL, payload);
            return response.data.data;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            return null;
        }
    }

    async deactivate(id: string): Promise<User | null> {
        try {
            const response = await api.patch<{ data: User }>(`${this.apiURL}/${id}/deactivate`);
            return response.data.data;
        } catch (error) {
            console.error("Error al desactivar usuario:", error);
            return null;
        }
    }

    async search(filters: UserFilters): Promise<User[]> {
        try {
            const response = await api.get<{ data: User[] }>(`${this.apiURL}/search`, {
                params: filters
            });
            return response.data.data ?? [];
        } catch (error) {
            console.error("Error al buscar usuarios:", error);
            return [];
        }
    }

    async emailExists(email: string, excludeId?: string): Promise<boolean> {
        const all = await this.getAll();
        return all.some(u => u.email === email && u.id !== excludeId);
    }

    async codeExists(code: string, excludeId?: string): Promise<boolean> {
        const all = await this.getAll();
        return all.some(u => u.code === code && u.id !== excludeId);
    }
}

export const userService = new UserService();
