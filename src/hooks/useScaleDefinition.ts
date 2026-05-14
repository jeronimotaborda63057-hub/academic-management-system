import { useEffect, useMemo, useState } from "react";

import type {
    CreateScaleDTO,
    Scale,
    UpdateScaleDTO
} from "../models/Scale";

import { scaleService } from "../services/scaleService";

/**
 * Props requeridas para cargar las escalas
 * de un criterio específico
 */
interface UseScaleDefinitionProps {
    criterionId?: string;
}

/**
 * Hook encargado de manejar toda la lógica
 * relacionada con las escalas/niveles de un criterio.
 *
 * Responsabilidades:
 * - Obtener escalas
 * - Crear escalas
 * - Actualizar escalas
 * - Eliminar escalas
 * - Validaciones básicas
 *
 * NO se encarga de:
 * - Renderizado UI
 * - Toasts
 * - Modales
 * - Inputs visuales
 *
 * Esto respeta SRP (Single Responsibility Principle)
 */
export const useScaleDefinition = ({
    criterionId
}: UseScaleDefinitionProps) => {

    /**
     * Lista de niveles cargados
     */
    const [scales, setScales] = useState<Scale[]>([]);

    /**
     * Estado de carga inicial
     */
    const [loading, setLoading] = useState(false);

    /**
     * Estado para operaciones create/update/delete
     */
    const [saving, setSaving] = useState(false);

    /**
     * Mensaje de error controlado
     */
    const [error, setError] = useState<string | null>(null);

    /**
     * Obtener escalas asociadas al criterio
     */
    const loadScales = async () => {

        /**
         * Evita llamadas innecesarias
         */
        if (!criterionId) return;

        try {
            setLoading(true);
            setError(null);

            /**
             * Obtener todas las escalas
             * desde el servicio base
             */
            const response = await scaleService.getAll();

            /**
             * Filtrar únicamente las escalas
             * pertenecientes al criterio activo
             */
            const filteredScales = response.filter(
                (scale: Scale) =>
                    scale.criterion_id === criterionId
            );

            setScales(filteredScales);

        } catch (error) {

            /**
             * Error controlado para UI
             */
            setError("No fue posible cargar los niveles.");

        } finally {

            /**
             * Finalizar loading
             */
            setLoading(false);
        }
    };

    /**
     * Crear un nuevo nivel
     */
    const createScale = async (
        data: CreateScaleDTO
    ) => {

        try {
            setSaving(true);
            setError(null);

            /**
             * Persistir nuevo nivel
             */
            const response = await scaleService.create(data);

            /**
             * Validación defensiva
             */
            if (!response) {
                return null;
            }

            /**
             * Actualizar estado local
             * sin volver a consultar API
             */
            setScales([
                ...scales,
                response
            ]);

            return response;

        } catch (error) {

            setError("No fue posible crear el nivel.");
            throw error;

        } finally {

            setSaving(false);
        }
    };

    /**
     * Actualizar nivel existente
     */
    const updateScale = async (
        id: string,
        data: UpdateScaleDTO
    ) => {

        try {
            setSaving(true);
            setError(null);

            /**
             * Actualizar en backend
             */
            const response = await scaleService.update(
                id,
                data
            );

            /**
             * Validación defensiva
             */
            if (!response) {
                return null;
            }

            /**
             * Reemplazar únicamente
             * el elemento actualizado
             */
            const updatedScales: Scale[] = scales.map(
                (scale) => {

                    return scale.id === id
                        ? response
                        : scale;
                }
            );

            setScales(updatedScales);

            return response;

        } catch (error) {

            setError("No fue posible actualizar el nivel.");
            throw error;

        } finally {

            setSaving(false);
        }
    };

    /**
     * Eliminar nivel
     */
    const deleteScale = async (id: string) => {

        try {
            setSaving(true);
            setError(null);

            /**
             * Eliminar en backend
             */
            await scaleService.delete(id);

            /**
             * Remover localmente
             */
            const filteredScales = scales.filter(
                (scale) => scale.id !== id
            );

            setScales(filteredScales);

        } catch (error) {

            setError("No fue posible eliminar el nivel.");
            throw error;

        } finally {

            setSaving(false);
        }
    };

    /**
     * Validaciones mínimas del conjunto
     * de escalas del criterio
     *
     * useMemo evita cálculos innecesarios
     * y mejora rendimiento
     */
    const isValid = useMemo(() => {

        /**
         * Deben existir mínimo 2 niveles
         */
        if (scales.length < 2) {
            return false;
        }

        /**
         * Validar nombres vacíos
         */
        const hasEmptyNames = scales.some(
            (scale) => !scale.name?.trim()
        );

        if (hasEmptyNames) {
            return false;
        }

        return true;

    }, [scales]);

    /**
     * Cargar escalas automáticamente
     * cuando cambia el criterio
     */
    useEffect(() => {
        loadScales();
    }, [criterionId]);

    /**
     * Exposición controlada del hook
     */
    return {
        scales,
        loading,
        saving,
        error,
        isValid,

        loadScales,
        createScale,
        updateScale,
        deleteScale
    };
};