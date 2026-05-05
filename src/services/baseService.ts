import axios from "axios";

export class BaseService<T> {
    protected apiURL: string;

    constructor(endpoint: string) {
        this.apiURL = `${import.meta.env.BASE_URL}/${endpoint}`; 
    }

    async getAll(): Promise<T[]> {
        try {
            const response = await axios.get<T[]>(this.apiURL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener: " + error)
            return []
        }
    }

    async getById(id: number): Promise<T | null> {
        try {
            const response = await axios.get<T>(`${this.apiURL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener: " + error)
            return null
        }
    }

    async create(data: Omit<T, "id">): Promise<T | null> {
        try {
            const response = await axios.post<T>(this.apiURL, data)
            return response.data;
        } catch (error) {
            console.error("Error al crear: " + error);
            return null;
        }
    }

    async update(id: number, data: Partial<T>): Promise<T | null> {
        try {
            const response = await axios.put<T>(`${this.apiURL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error al editar: " + error);
            return null;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await axios.delete(`${this.apiURL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar: " + error);
            return false;
        }
    }
}   