import { api } from "../interceptors/authInterceptor";
import type { Enrollment } from "../models/Enrollment";
import { BaseService } from "./baseService";

export class EnrollmentService extends BaseService<Enrollment> {
    constructor() {
        super("academic/enrollments");
    }

    async search(filters: Record<string, any>): Promise<Enrollment[]> {
        try {
            const response = await api.get<{ data: Enrollment[] }>(
                `${this.apiURL}/search`,
                { params: filters }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error al buscar inscripciones:", error);
            return [];
        }
    }

    
}

export const enrollmentService = new EnrollmentService();