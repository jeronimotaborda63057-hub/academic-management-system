import { api } from "../interceptors/authInterceptor";
import type { Enrollment } from "../models/Enrollment";
import { BaseService } from "./baseService";

type SearchFilters = Record<string, string | number | boolean | undefined>;

export interface CreateGroupEnrollmentPayload {
    enrollment_date: string;
    group_id: string;
    status: "ACTIVE";
    student_id: string;
}

export class EnrollmentService extends BaseService<Enrollment> {
    constructor() {
        super("academic/enrollments");
    }

    async search(filters: SearchFilters): Promise<Enrollment[]> {
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

    async getAllWithAuth(): Promise<Enrollment[]> {
        const response = await api.get<{ data: Enrollment[] }>(this.apiURL);
        return response.data.data ?? [];
    }

    async createGroupEnrollment(payload: CreateGroupEnrollmentPayload): Promise<Enrollment | null> {
        const response = await api.post<{ data: Enrollment }>(this.apiURL, payload);
        return response.data.data ?? null;
    }

    async cancel(id: string): Promise<Enrollment | null> {
        const response = await api.put<{ data: Enrollment }>(
            `${this.apiURL}/${id}`,
            { status: "INACTIVE" }
        );
        return response.data.data ?? null;
    }
    
    
}

export const enrollmentService = new EnrollmentService();
