import axios from 'axios';
import type { ApiResponse } from '../models/services/ApiResponse';

const api = axios.create({
    baseURL: '/api',
});
// 🔥 PRINCIPIO SOLID: reutilizable
export class BaseService<T> {
    protected apiURL: string;

    constructor(apiURL: string) {
        this.apiURL = apiURL;
    }

    async getAll(): Promise<T[]> {
        try {
            const response = await api.get<ApiResponse<T[]>>(this.apiURL);
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener:", error);
            return [];
        }
    }

    async getById(id: string): Promise<T | null> {
        try {
            const response = await api.get<ApiResponse<T>>(`${this.apiURL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener por id:", error);
            return null;
        }
    }

    async create(data: Omit<T, "id" | "created_at" | "updated_at">): Promise<T | null> {
        try {
            const response = await api.post<{ data: T }>(this.apiURL, data);
            return response.data.data;
        } catch (error) {
            console.error("Error al crear: " + error);
            return null;
        }
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        try {
            const response = await api.put<ApiResponse<T>>(`${this.apiURL}/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error("Error al actualizar:", error);
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await api.delete(`${this.apiURL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar:", error);
            return false;
        }
    }
}