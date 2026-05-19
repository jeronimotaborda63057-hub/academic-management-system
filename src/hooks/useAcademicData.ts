import { useState, useEffect } from "react";
import { academicReportService, type AcademicDataPayload } from "../services/academicReportService";

// DIP: Pasamos el servicio por defecto, pero permitimos inyectar otro (por ejemplo en tests)
export const useAcademicData = (dataService = academicReportService) => {
    const [data, setData] = useState<AcademicDataPayload | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await dataService.fetchCompleteAcademicData();
            setData(res);
        } catch {
            setError("No fue posible cargar las calificaciones oficiales.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return { data, loading, error };
};