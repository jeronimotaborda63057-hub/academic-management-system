import type { GradeDetail } from "../models/uml/GradeDetail";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export class GradeDetailService extends BaseService<GradeDetail> {
    constructor() {
        super("evaluation/grade-details");
    }

    async getAllWithScale(): Promise<GradeDetail[]> {
        const response = await api.get<{ data: GradeDetail[] }>(this.apiURL);
        return response.data.data ?? [];
    }
}

export const gradeDetailService = new GradeDetailService();
