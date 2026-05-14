import type { Rubric } from "../models/Rubric";
import { BaseService } from "./baseService";
import { api } from "../interceptors/authInterceptor";

export class RubricService extends BaseService<Rubric> {
    constructor() {
        super("evaluation/rubrics");
    }

    async publish(id: string): Promise<Rubric | null> {
        return this.update(id, { is_public: true });
    }

    async archive(id: string): Promise<Rubric | null> {
        return this.update(id, { is_archived: true });
    }

    async unarchive(id: string): Promise<Rubric | null> {
        return this.update(id, { is_archived: false });
    }

    async deleteById(id: string): Promise<boolean> {
        try {
            await api.delete(`/api/evaluation/rubrics/${id}`);
            return true;
        } catch (error) {
            console.error(`[rubricService] deleteById(${id}) falló:`, error);
            return false;
        }
    }
}

export const rubricService = new RubricService();