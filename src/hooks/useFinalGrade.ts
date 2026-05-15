import { useState, useEffect, useCallback } from 'react';
import { finalGradeService } from '../services/finalGradeService';
import type { FinalGradeConsolidated } from '../models/FinalGrade';

interface UseFinalGradeProps {
    groupId: string;
}

interface UseFinalGradeReturn {
    consolidated: FinalGradeConsolidated | null;
    loading: boolean;
    confirming: boolean;
    savingDraft: boolean;
    error: string | null;
    fetchConsolidated: () => Promise<void>;
    confirmOfficial: () => Promise<boolean>;
    saveDraft: () => Promise<boolean>;
    downloadReport: () => Promise<void>;
}

// Hook que encapsula toda la lógica de CU-12: Registrar nota final
export const useFinalGrade = ({ groupId }: UseFinalGradeProps): UseFinalGradeReturn => {

    const [consolidated, setConsolidated] = useState<FinalGradeConsolidated | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Carga el consolidado del grupo desde el backend
    const fetchConsolidated = useCallback(async () => {
        if (!groupId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await finalGradeService.getConsolidatedByGroup(groupId);
            setConsolidated(data);
        } catch {
            setError('No se pudo cargar el consolidado. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    // Confirma el registro oficial (bloquea edición y genera reporte)
    const confirmOfficial = async (): Promise<boolean> => {
        setConfirming(true);
        try {
            const ok = await finalGradeService.confirmOfficialRegistration(groupId);
            if (ok) {
                // Recargar para reflejar el nuevo estado is_confirmed = true
                await fetchConsolidated();
            }
            return ok;
        } finally {
            setConfirming(false);
        }
    };

    // Guarda borrador sin confirmar oficialmente
    const saveDraft = async (): Promise<boolean> => {
        setSavingDraft(true);
        try {
            return await finalGradeService.saveDraft(groupId);
        } finally {
            setSavingDraft(false);
        }
    };

    // Descarga el reporte del grupo como PDF
    const downloadReport = async () => {
        const blob = await finalGradeService.generateReport(groupId);
        if (!blob) return;

        // Crea un link temporal para forzar la descarga del archivo
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-notas-grupo-${groupId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Carga el consolidado al montar el componente
    useEffect(() => {
        fetchConsolidated();
    }, [fetchConsolidated]);

    return {
        consolidated,
        loading,
        confirming,
        savingDraft,
        error,
        fetchConsolidated,
        confirmOfficial,
        saveDraft,
        downloadReport,
    };
};