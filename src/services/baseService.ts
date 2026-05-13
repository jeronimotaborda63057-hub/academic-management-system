import { api } from '../interceptors/authInterceptor';
import type { ApiResponse } from '../models/Services/ApiResponse';

// 🔥 PRINCIPIO SOLID: reutilizable
export class BaseService<T> {
    protected apiURL: string;

    constructor(apiURL: string) {
        this.apiURL = apiURL;
    }

    // Las URLs van como /api/academic/subjects, /api/evaluation/rubrics, etc.
    // El proxy de Vite las reenvía a http://localhost:5000 manteniendo el path completo.

    async getAll(): Promise<T[]> {
        try {
            const response = await api.get<ApiResponse<T[]>>(`/api/${this.apiURL}`);
            return response.data.data;
        } catch (error) {
            console.error(`[${this.apiURL}] Error al obtener:`, error);
            return [];
        }
    }

    async getById(id: string): Promise<T | null> {
        try {
            const response = await api.get<ApiResponse<T>>(`/api/${this.apiURL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`[${this.apiURL}] Error al obtener por id:`, error);
            return null;
        }
    }

    async create(data: Partial<T>): Promise<T | null> {
        const response = await api.post<ApiResponse<T>>(`/api/${this.apiURL}`, data);
        return response.data.data;
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const response = await api.put<ApiResponse<T>>(`/api/${this.apiURL}/${id}`, data);
        return response.data.data;
    }

    async delete(id: number): Promise<boolean> {
        try {
            await api.delete(`/api/${this.apiURL}/${id}`);
            return true;
        } catch (error) {
            console.error(`[${this.apiURL}] Error al eliminar:`, error);
            return false;
        }
    }
}