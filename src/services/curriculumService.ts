import { api } from "./baseService";
import type { Curriculum } from "../models/Curriculum";
import type { Subject } from "../models/Subject";
import { BaseService } from "./baseService";

export class CurriculumService extends BaseService<Curriculum> {
    constructor() {
        super("/academic/study-plans");
    }

    async getSubjects(planId: string): Promise<Subject[]> {
        try {
            const response = await api.get<{ data: Subject[] }>(
                `${this.apiURL}/${planId}/subjects`
            );
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener asignaturas del plan:", error);
            return [];
        }
    }

    async addSubject(planId: string, subjectId: string): Promise<boolean> {
        try {
            await api.post(`${this.apiURL}/${planId}/subjects/${subjectId}`);
            return true;
        } catch (error) {
            console.error("Error al vincular asignatura:", error);
            return false;
        }
    }

    async removeSubject(planId: string, subjectId: string): Promise<boolean> {
        try {
            await api.delete(`${this.apiURL}/${planId}/subjects/${subjectId}`);
            return true;
        } catch (error) {
            console.error("Error al desvincular asignatura:", error);
            return false;
        }
    }

    async publish(planId: string): Promise<Curriculum | null> {
        try {
            const response = await api.put<{ data: Curriculum }>(
                `${this.apiURL}/${planId}`,
                { is_published: true }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error al publicar plan:", error);
            return null;
        }
    }
}

export const curriculumService = new CurriculumService();