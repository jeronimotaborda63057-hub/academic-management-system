import { api } from "./baseService";
import type { CreateUserPayload, User } from "../models/User";
import type { UserFilters } from "../models/UserFilters";
import { BaseService } from "./baseService";

export class UserService extends BaseService<User> {
    constructor() {
        super("/users");
    }

    async createUser(payload: CreateUserPayload): Promise<User | null> {
        try {
            console.log(api.defaults.baseURL);
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
}

export const userService = new UserService();