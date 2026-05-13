import type { Criteria } from "../models/Criteria";
import { BaseService } from "./baseService";

/**
 * CriteriaService — CRUD para criterios de rúbricas.
 *
 * Principio SOLID:
 *  - SRP: solo gestiona criterios.
 *  - DIP: depende de BaseService (abstracción), no de axios directamente.
 */
export class CriteriaService extends BaseService<Criteria> {
    constructor() {
        super("evaluation/criteria");
    }

    /**
     * Obtiene todos los criterios de una rúbrica específica.
     */
    async getByRubric(rubricId: string): Promise<Criteria[]> {
        const all = await this.getAll();
        return all.filter((c) => c.rubric_id === rubricId);
    }
}

export const criteriaService = new CriteriaService();