import type { Grade } from "../models/Grade";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export interface GradeDetailPayload {
    scale_id: string;
    student_id: string;
    score: number;
    comment?: string;
}

export interface SaveRubricGradePayload {
    rubric_id: string;
    enrollment_id: string;
    final_score: number;
    status: "DRAFT" | "SUBMITTED";
    observations?: string;
    details: GradeDetailPayload[];
}

export class GradeService extends BaseService<Grade> {
    constructor() {
        super("evaluation/grades");
    }

    async getAllWithDetails(): Promise<Grade[]> {
        const response = await api.get<{ data: Grade[] }>(this.apiURL);
        return response.data.data ?? [];
    }

    async search(filters: Record<string, string>): Promise<Grade[]> {
        const response = await api.get<{ data: Grade[] }>(
            `${this.apiURL}/search`,
            { params: filters }
        );
        return response.data.data ?? [];
    }

    async saveRubricGrade(payload: SaveRubricGradePayload): Promise<Grade | null> {
        const response = await api.post<{ data: Grade }>(this.apiURL, payload);
        return response.data.data ?? null;
    }

    async updateRubricGrade(id: string, payload: SaveRubricGradePayload): Promise<Grade | null> {
        const response = await api.put<{ data: Grade }>(`${this.apiURL}/${id}`, payload);
        return response.data.data ?? null;
    }
}

export const gradeService = new GradeService();
