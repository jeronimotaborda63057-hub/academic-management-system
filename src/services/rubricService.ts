import type { Rubric } from "../models/Rubric";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export class RubricService extends BaseService<Rubric>{
    constructor(){
        super("evaluation/rubrics");
    }

    async getByIdWithAuth(id: string): Promise<Rubric | null> {
        const response = await api.get<{ data: Rubric }>(`${this.apiURL}/${id}`);
        return response.data.data ?? null;
    }

    async getAllWithAuth(): Promise<Rubric[]> {
        const response = await api.get<{ data: Rubric[] }>(this.apiURL);
        return response.data.data ?? [];
    }
}

export const rubricService = new RubricService();
