import type { Criteria } from "../models/Criteria";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export class CriteriaService extends BaseService<Criteria> {
    constructor() {
        super("evaluation/criteria");
    }

    async getByRubric(rubricId: string): Promise<Criteria[]> {
        const response = await api.get<{ data: Criteria[] }>(this.apiURL);
        return (response.data.data ?? []).filter(
            (criterion) => String(criterion.rubric_id) === rubricId
        );
    }
}

export const criteriaService = new CriteriaService();
