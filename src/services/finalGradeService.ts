import { api } from "../interceptors/authInterceptor";
import type { FinalGradeConsolidated } from "../models/FinalGrade";

export class FinalGradeService { //
    //Obtiene el consolidado de notas finales por grupo 
    //Retorna los datos agrupados por inscripción (Registration) con suma ponderada de Evaluaciones 
    async getConsolidatedByGroup(groupId: string): Promise<FinalGradeConsolidated | null> {
        try {
            const response = await api.get<{ data: FinalGradeConsolidated }>(`/api/evaluation / grades / ${groupId}`);
            return response.data.data;
        } catch (error) {
            console.error('[finalGradeService] Error al obtener consolidado:', error); return null;
        }
    }
    // Confirma el registro oficial de notas para un grupo // Bloquea edición de Nota y genera reporte (postcondición CU-12) 
    async confirmOfficialRegistration(groupId: string): Promise<boolean> {
        try {
            await api.post(`/api/evaluation / grades / confirm / ${groupId}`);
            return true;
        } catch (error) {
            console.error('[finalGradeService] Error al confirmar registro oficial:', error);
            return false;
        }
    }
    // Guarda borrador sin confirmar oficialmente (no bloquea la Nota) 
    async saveDraft(groupId: string): Promise<boolean> {
        try {
            await api.post(`/api/evaluation / grades / draft / ${groupId}`);
            return true;
        } catch (error) {
            console.error('[finalGradeService] Error al guardar borrador:', error);
            return false;
        }
    }
    // Genera/descarga el reporte del grupo en PDF 
    async generateReport(groupId: string): Promise<Blob | null> {
        try {
            const response = await api.get(`/api/evaluation / grades / report / ${groupId}`, { responseType: 'blob' });
            return response.data;
        } catch (error) {
            console.error('[finalGradeService] Error al generar reporte:', error);
            return null;
        }
    }
}
export const finalGradeService = new FinalGradeService();