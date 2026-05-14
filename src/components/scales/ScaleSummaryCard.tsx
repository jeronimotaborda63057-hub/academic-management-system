// src/components/scales/ScaleSummaryCard.tsx

import type { Criteria } from "../../models/Criteria";
import type { Scale } from "../../models/Scale";

import SummaryCard from "../common/SummaryCard";

interface ScaleSummaryCardProps {

    /**
     * Criterio seleccionado
     */
    criterion?: Criteria;

    /**
     * Lista de niveles
     */
    scales: Scale[];
}

/**
 * Resumen reutilizando EXACTAMENTE
 * la misma componente usada en CU-05.
 *
 * Esto evita:
 * - duplicación
 * - inconsistencias visuales
 * - múltiples cards similares
 *
 * Respeta:
 * - SOLID
 * - DRY
 */
export const ScaleSummaryCard = ({
    criterion,
    scales
}: ScaleSummaryCardProps) => {

    /**
     * Calcular valor máximo
     */
    const maxValue = Math.max(
        ...scales.map((scale) => scale.value || 0),
        0
    );

    /**
     * Construcción resumen
     */
    const summaryItems = criterion
        ? [
            {
                label: "Criterio",
                value: criterion.name || "-"
            },
            {
                label: "Peso",
                value: `${criterion.weight || 0}%`
            },
            {
                label: "Niveles",
                value: `${scales.length}`
            },
            {
                label: "Valor máximo",
                value: `${maxValue}`
            }
        ]
        : [];

    return (

        <SummaryCard
            title="Resumen"
            hasData={!!criterion}
            items={summaryItems}
            emptyMessage="
                Selecciona un criterio para visualizar su resumen.
            "
        />
    );
};