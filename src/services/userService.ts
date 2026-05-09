import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";
import type { User, CreateUserPayload, UserFilters } from "../models/User";

export class UserService extends BaseService<User> {
    constructor() {
        super("/api/users");
    }

    // Sobreescribimos create porque el payload es diferente al User base
    async createUser(payload: CreateUserPayload): Promise<User | null> {
        try {
            const response = await api.post<{ data: User }>(this.apiURL, payload);
            return response.data.data;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            return null;
        }
    }

    // PATCH /api/users/<id>/deactivate — no elimina, solo is_active = false
    async deactivate(id: string): Promise<User | null> {
        try {
            const response = await api.patch<{ data: User }>(`${this.apiURL}/${id}/deactivate`);
            return response.data.data;
        } catch (error) {
            console.error("Error al desactivar usuario:", error);
            return null;
        }
    }

    // GET /api/users/search?role=TEACHER&is_active=true...
    async search(filters: UserFilters): Promise<User[]> {
        try {
            const response = await api.get<{ data: User[] }>(`${this.apiURL}/search`, {
                params: filters
            });
            return response.data.data;
        } catch (error) {
            console.error("Error al buscar usuarios:", error);
            return [];
        }
    }
}

export const userService = new UserService();