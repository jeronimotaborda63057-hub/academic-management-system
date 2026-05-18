import type { Grade } from "../models/Grade";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export interface GradeDetailPayload {
    scale_id: string;
    comment?: string;
}

export interface SaveRubricGradePayload {
    enrollment_id: string;
    rubric_id: string;
    status: "DRAFT" | "SENT";
    observations?: string;
    details: GradeDetailPayload[];
}

export interface FinalizeGradePayload {
    is_locked: boolean;
    observations?: string;
    status?: "DRAFT" | "SENT";
}

const buildRubricGradeRequest = (
    payload: SaveRubricGradePayload
): SaveRubricGradePayload => ({
    enrollment_id: payload.enrollment_id,
    rubric_id: payload.rubric_id,
    status: payload.status,
    observations: payload.observations ?? "",
    details: payload.details.map((detail) => ({
        scale_id: detail.scale_id,
        comment: detail.comment ?? "",
    })),
});

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
        const response = await api.post<{ data: Grade }>(
            this.apiURL,
            buildRubricGradeRequest(payload)
        );
        return response.data.data ?? null;
    }

    async updateRubricGrade(id: string, payload: FinalizeGradePayload): Promise<Grade | null> {
        const response = await api.put<{ data: Grade }>(
            `${this.apiURL}/${id}`,
            payload
        );

        return response.data.data ?? null;
    }

    async finalizeGrade(id: string, payload: FinalizeGradePayload): Promise<Grade | null> {
        const response = await api.put<{ data: Grade }>(`${this.apiURL}/${id}`, payload);
        return response.data.data ?? null;
    }
}

export const gradeService = new GradeService();
