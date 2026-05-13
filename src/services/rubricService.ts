import type { Rubric } from "../models/Rubric";
import { BaseService } from "./baseService";

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
}

export const rubricService = new RubricService();