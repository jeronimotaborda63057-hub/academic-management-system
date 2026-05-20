import { api } from "../interceptors/authInterceptor";
import type { FinalGradeConsolidated } from "../models/interfaces/FinalGrade";

export class FinalGradeService {
    async getConsolidatedByGroup(groupId: string): Promise<FinalGradeConsolidated | null> {
        try {
            const response = await api.get<{ data: FinalGradeConsolidated }>(
                `evaluation/grades/${groupId}`
            );
            return response.data.data;
        } catch (error) {
            console.error("[finalGradeService] Error al obtener consolidado:", error);
            return null;
        }
    }

    async confirmOfficialRegistration(groupId: string): Promise<boolean> {
        try {
            await api.post(`evaluation/grades/confirm/${groupId}`);
            return true;
        } catch (error) {
            console.error("[finalGradeService] Error al confirmar registro oficial:", error);
            return false;
        }
    }

    async saveDraft(groupId: string): Promise<boolean> {
        try {
            await api.post(`evaluation/grades/draft/${groupId}`);
            return true;
        } catch (error) {
            console.error("[finalGradeService] Error al guardar borrador:", error);
            return false;
        }
    }

    async generateReport(groupId: string): Promise<Blob | null> {
        try {
            const response = await api.get(`evaluation/grades/report/${groupId}`, {
                responseType: "blob",
            });
            return response.data;
        } catch (error) {
            console.error("[finalGradeService] Error al generar reporte:", error);
            return null;
        }
    }
}

export const finalGradeService = new FinalGradeService();
