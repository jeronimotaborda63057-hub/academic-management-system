import type { Criteria } from "../models/Criteria";
import { BaseService } from "./baseService";
import { api } from "../interceptors/authInterceptor";

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

    /** Filtra localmente los criterios de una rúbrica. */
    async getByRubric(rubricId: string): Promise<Criteria[]> {
        const all = await this.getAll();
        return all.filter((c) => c.rubric_id === rubricId);
    }

    /**
     * Elimina un criterio por UUID.
     * El backend no acepta subject_id ni is_archived — solo el UUID en la URL.
     */
    async deleteById(id: string): Promise<boolean> {
        try {
            await api.delete(`/api/evaluation/criteria/${id}`);
            return true;
        } catch (error) {
            console.error(`[criteriaService] deleteById(${id}) falló:`, error);
            return false;
        }
    }

    /**
     * Elimina TODOS los criterios existentes de una rúbrica en paralelo.
     * Debe llamarse ANTES de crear los criterios nuevos en Edit.tsx.
     */
    async deleteByRubric(rubricId: string): Promise<void> {
        const existing = await this.getByRubric(rubricId);
        if (existing.length === 0) return;
        await Promise.all(existing.map((c) => this.deleteById(c.id!)));
    }
}

export const criteriaService = new CriteriaService();