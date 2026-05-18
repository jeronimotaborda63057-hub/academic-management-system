import { useEffect, useMemo, useState } from "react";

import type {
    CreateScaleDTO,
    Scale,
    UpdateScaleDTO
} from "../models/uml/Scale";

import { scaleService } from "../services/scaleService";

interface UseScaleDefinitionProps {
    criterionId?: string;
}

export const useScaleDefinition = ({
    criterionId
}: UseScaleDefinitionProps) => {

    const [allScales, setAllScales] =        // ← nuevo
        useState<Scale[]>([]);

    const [scales, setScales] =
        useState<Scale[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const loadScales = async () => {

        if (!criterionId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await scaleService.getAll();

            setAllScales(response);              // ← guardar todas

            const filteredScales = response.filter(
                (scale: Scale) =>
                    scale.criterion_id === criterionId
            );

            setScales(filteredScales);

        } catch {
            setError("No fue posible cargar los niveles.");
        } finally {
            setLoading(false);
        }
    };

    const createScale = async (data: CreateScaleDTO) => {
        try {
            setSaving(true);
            setError(null);

            const response = await scaleService.create(data);

            if (!response) return null;

            setScales([...scales, response]);
            setAllScales([...allScales, response]); // ← sincronizar

            return response;

        } catch {
            setError("No fue posible crear el nivel.");
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const updateScale = async (id: string, data: UpdateScaleDTO) => {
        try {
            setSaving(true);
            setError(null);

            const response = await scaleService.update(id, data);

            if (!response) return null;

            const updatedScales = scales.map(
                (scale) => scale.id === id ? response : scale
            );

            const updatedAllScales = allScales.map(  // ← sincronizar
                (scale) => scale.id === id ? response : scale
            );

            setScales(updatedScales);
            setAllScales(updatedAllScales);

            return response;

        } catch {
            setError("No fue posible actualizar el nivel.");
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const deleteScale = async (id: string) => {
        try {
            setSaving(true);
            setError(null);

            await scaleService.delete(id);

            setScales(scales.filter((s) => s.id !== id));
            setAllScales(allScales.filter((s) => s.id !== id)); // ← sincronizar

        } catch {
            setError("No fue posible eliminar el nivel.");
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const isValid = useMemo(() => {
        if (scales.length < 2) return false;
        const hasEmptyNames = scales.some((s) => !s.name?.trim());
        if (hasEmptyNames) return false;
        return true;
    }, [scales]);

    useEffect(() => {
        loadScales();
    }, [criterionId]);

    return {
        allScales,      // ← expuesto
        scales,
        loading,
        saving,
        error,
        isValid,
        loadScales,
        createScale,
        updateScale,
        deleteScale,
    };
};