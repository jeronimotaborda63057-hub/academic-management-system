import { useEffect, useMemo, useState } from "react";

import type {
    CreateScaleDTO,
    Scale,
    UpdateScaleDTO
} from "../models/Scale";

import { scaleService } from "../services/scaleService";

interface UseScaleDefinitionProps {
    criterionId?: string;
}

export const useScaleDefinition = ({
    criterionId
}: UseScaleDefinitionProps) => {

    const [allScales, setAllScales] =
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

            setAllScales(response);

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

    // ── Validación de valor único dentro del criterio ──────

    const isDuplicateValue = (value: number, excludeId?: string): boolean =>
        scales.some(
            (scale) => scale.value === value && scale.id !== excludeId
        );

    const createScale = async (data: CreateScaleDTO) => {
        if (isDuplicateValue(data.value)) {
            setError(`Ya existe un nivel con el valor "${data.value}" en este criterio.`);
            return null;
        }

        try {
            setSaving(true);
            setError(null);

            const response = await scaleService.create(data);
            if (!response) return null;

            setScales((prev) => [...prev, response]);
            setAllScales((prev) => [...prev, response]);

            return response;

        } catch {
            setError("No fue posible crear el nivel.");
            return null;
        } finally {
            setSaving(false);
        }
    };

    const updateScale = async (id: string, data: UpdateScaleDTO) => {
        if (data.value !== undefined && isDuplicateValue(data.value, id)) {
            setError(`Ya existe un nivel con el valor "${data.value}" en este criterio.`);
            return null;
        }

        try {
            setSaving(true);
            setError(null);

            const response = await scaleService.update(id, data);
            if (!response) return null;

            setScales((prev) => prev.map((s) => s.id === id ? response : s));
            setAllScales((prev) => prev.map((s) => s.id === id ? response : s));

            return response;

        } catch {
            setError("No fue posible actualizar el nivel.");
            return null;
        } finally {
            setSaving(false);
        }
    };

    const deleteScale = async (id: string) => {
        try {
            setSaving(true);
            setError(null);

            await scaleService.delete(id);

            setScales((prev) => prev.filter((s) => s.id !== id));
            setAllScales((prev) => prev.filter((s) => s.id !== id));

        } catch {
            setError("No fue posible eliminar el nivel.");
        } finally {
            setSaving(false);
        }
    };

    const isValid = useMemo(() => {
        if (scales.length < 2) return false;
        if (scales.some((s) => !s.name?.trim())) return false;
        const values = scales.map((s) => s.value);
        if (new Set(values).size !== values.length) return false;
        return true;
    }, [scales]);

    useEffect(() => {
        loadScales();
    }, [criterionId]);

    return {
        allScales,
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