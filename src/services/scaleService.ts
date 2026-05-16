import type { Scale } from "../models/Scale";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export class ScaleService extends BaseService<Scale> {
    constructor() {
        super("evaluation/scales");
    }

    async getByCriteria(criteriaIds: string[]): Promise<Scale[]> {
        const response = await api.get<{ data: Scale[] }>(this.apiURL);
        const allowedIds = new Set(criteriaIds);
        return (response.data.data ?? []).filter(
            (scale) => scale.criterion_id && allowedIds.has(scale.criterion_id)
        );
    }

    async getAllWithAuth(): Promise<Scale[]> {
        const response = await api.get<{ data: Scale[] }>(this.apiURL);
        return response.data.data ?? [];
    }
}

export const scaleService = new ScaleService();
