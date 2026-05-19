import { useMemo } from "react";
import type { Scale } from "../models/uml/Scale";

interface UseClonableScalesProps {
    allScales: Scale[];
    criterionId: string;
}

interface UseClonableScalesReturn {
    clonableScales: Scale[];
}

/**
 * SRP → única responsabilidad: filtrar escalas clonables.
 * DIP → recibe allScales por parámetro, no llama servicios.
 * OCP → la lógica de filtrado es extensible sin tocar otros archivos.
 */
export const useClonableScales = ({
    allScales,
    criterionId,
}: UseClonableScalesProps): UseClonableScalesReturn => {

    /**
     * useMemo evita recalcular en cada render.
     * Solo recalcula cuando cambian las escalas
     * o el criterio activo.
     */
    const clonableScales = useMemo(() => {

        return allScales.filter(
            (scale) => scale.criterion_id !== criterionId
        );

    }, [allScales, criterionId]);

    return { clonableScales };
};