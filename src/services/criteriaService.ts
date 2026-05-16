import type { Criteria } from "../models/Criteria";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

/**
 * CriteriaService — CRUD para criterios de rúbricas.
 *
 * Principio SOLID:
 *  - SRP: solo gestiona criterios, sin lógica de rúbricas.
 *  - DIP: depende de BaseService (abstracción), no de axios directamente.
 *
 * FIX CU-08:
 *  - `deleteById`   — usa UUID de string en la URL (el backend no acepta enteros).
 *  - `deleteByRubric` — elimina todos los criterios de una rúbrica antes de
 *    re-crearlos, evitando la duplicación que rompía la validación del 100%.
 */
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

    async getAllWithAuth(): Promise<Criteria[]> {
        const response = await api.get<{ data: Criteria[] }>(this.apiURL);
        return response.data.data ?? [];
    }

    async deleteById(id: string): Promise<boolean> {
        return this.delete(id);
    }

    async deleteByRubric(rubricId: string): Promise<void> {
        const criteria = await this.getByRubric(rubricId);
        await Promise.all(
            criteria
                .filter((criterion) => Boolean(criterion.id))
                .map((criterion) => this.deleteById(criterion.id))
        );
    }
}

export const criteriaService = new CriteriaService();
