import type { Evaluation } from "../models/uml/Evaluation";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export class EvaluationService extends BaseService<Evaluation> {
    constructor() {
        super("evaluation/evaluations");
    }

    async getAllWithRubrics(): Promise<Evaluation[]> {
        const response = await api.get<{ data: Evaluation[] }>(this.apiURL);
        return response.data.data ?? [];
    }

    async getWithRubric(id: string): Promise<Evaluation | null> {
        const response = await api.get<{ data: Evaluation }>(`${this.apiURL}/${id}`);
        return response.data.data ?? null;
    }

    async associateRubric(evaluationId: string, rubricId: string): Promise<Evaluation | null> {
        const response = await api.patch<{ data: Evaluation }>(
            `${this.apiURL}/${evaluationId}/associate-rubric/${rubricId}`
        );
        return response.data.data ?? null;
    }
}

export const evaluationService = new EvaluationService();
