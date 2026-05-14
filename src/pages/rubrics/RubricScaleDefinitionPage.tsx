// src/pages/rubrics/RubricScaleDefinitionPage.tsx

import { useEffect, useMemo, useState } from "react";

import type { Criteria } from "../../models/Criteria";
import type { Rubric } from "../../models/Rubric";

import { rubricService } from "../../services/rubricService";
import { criteriaService } from "../../services/criteriaService";

import { useScaleDefinition } from "../../hooks/useScaleDefinition";

import PageHeader from "../../components/common/PageHeader";

import { CriteriaSidebar } from "../../components/scales/CriteriaSidebar";
import { ScaleLevelsTable } from "../../components/scales/ScaleLevelsTable";
import { ScaleSummaryCard } from "../../components/scales/ScaleSummaryCard";

/**
 * Página principal CU-09.
 *
 * Responsabilidades:
 * - Coordinar estado general
 * - Consumir hooks
 * - Consumir servicios
 * - Orquestar componentes
 *
 * NO:
 * - contiene lógica de negocio compleja
 * - contiene persistencia directa
 * - contiene renderizados gigantes
 *
 * Respeta:
 * - SRP
 * - DIP
 * - composición reutilizable
 */
const RubricScaleDefinitionPage = () => {

    /**
     * Rúbrica activa
     */
    const [rubric, setRubric] =
        useState<Rubric | null>(null);

    /**
     * Lista de criterios
     */
    const [criteria, setCriteria] =
        useState<Criteria[]>([]);

    /**
     * Estado loading general
     */
    const [loadingRubric, setLoadingRubric] =
        useState(false);

    /**
     * Error controlado
     */
    const [error, setError] =
        useState<string | null>(null);

    /**
     * Criterio seleccionado
     */
    const [selectedCriterion, setSelectedCriterion] =
        useState<Criteria | null>(null);

    /**
     * Hook escalas
     */
    const {
        scales,
        loading,
        saving,

        createScale,
        updateScale,
        deleteScale
    } = useScaleDefinition({
        criterionId: selectedCriterion?.id
    });

    /**
     * Obtener rúbrica
     */
    const loadRubric = async () => {

        try {
            setLoadingRubric(true);
            setError(null);

            /**
             * Obtener rúbrica
             */
            const rubricResponse =
                await rubricService.getById(
                    "8d50acfb-cc75-4b6f-b6ee-b3785842d9f0"
                );

            if (!rubricResponse) {
                return;
            }

            setRubric(rubricResponse);

            /**
             * Obtener TODOS los criterios
             *
             * IMPORTANTE:
             * El backend actual NO incluye
             * relaciones automáticamente.
             *
             * Por eso se consume
             * criteriaService.getAll()
             */
            const criteriaResponse =
                await criteriaService.getAll();

            /**
             * Filtrar criterios asociados
             * a la rúbrica actual
             */
            const rubricCriteria =
                criteriaResponse.filter(
                    (criterion: Criteria) =>
                        criterion.rubric_id === rubricResponse.id
                );

            setCriteria(rubricCriteria);

            /**
             * Seleccionar primer criterio
             * automáticamente
             */
            if (rubricCriteria.length > 0) {

                setSelectedCriterion(
                    rubricCriteria[0]
                );
            }

        } catch (error) {

            setError(
                "No fue posible cargar la rúbrica."
            );

        } finally {

            setLoadingRubric(false);
        }
    };

    /**
     * Total niveles
     */
    const totalLevels = useMemo(() => {
        return scales.length;
    }, [scales]);

    /**
     * Inicialización
     */
    useEffect(() => {
        loadRubric();
    }, []);

    return (

        <div className="space-y-6">

            {/* ================= HEADER ================= */}

            <PageHeader
                title="Definir criterios y escalas"
                subtitle="
                    Configura los niveles de desempeño
                    asociados a cada criterio de la rúbrica.
                "
            />

            {/* ================= ERROR ================= */}

            {
                error && (

                    <div
                        className="
                            bg-red-50
                            border border-red-200
                            text-red-600
                            rounded-xl
                            px-4 py-3
                            text-sm
                        "
                    >
                        {error}
                    </div>
                )
            }

            {/* ================= CONTENT ================= */}

            <div
                className="
                    grid grid-cols-12
                    gap-6
                    items-start
                "
            >

                {/* ================= SIDEBAR ================= */}

                <div className="col-span-3">

                    <CriteriaSidebar
                        criteria={criteria}
                        selectedCriterionId={
                            selectedCriterion?.id
                        }
                        onSelectCriterion={
                            setSelectedCriterion
                        }
                    />

                </div>

                {/* ================= TABLA ================= */}

                <div className="col-span-6">

                    <ScaleLevelsTable
                        scales={scales}
                        loading={loading}
                        saving={saving}

                        onCreate={createScale}
                        onUpdate={updateScale}
                        onDelete={deleteScale}
                    />

                </div>

                {/* ================= RESUMEN ================= */}

                <div className="col-span-3">

                    <ScaleSummaryCard
                        criterion={
                            selectedCriterion || undefined
                        }
                        scales={scales}
                    />

                    {/* ================= INFO EXTRA ================= */}

                    <div
                        className="
                            mt-6
                            bg-white
                            border border-gray-200
                            rounded-2xl
                            p-5
                        "
                    >

                        <h3
                            className="
                                text-sm
                                font-semibold
                                text-gray-800
                                mb-4
                            "
                        >
                            Reglas
                        </h3>

                        <ul
                            className="
                                flex flex-col
                                gap-3
                                text-sm
                                text-gray-600
                            "
                        >

                            <li>
                                • Deben existir mínimo 2 niveles.
                            </li>

                            <li>
                                • Los nombres no pueden estar vacíos.
                            </li>

                            <li>
                                • Los valores deben ser únicos.
                            </li>

                            <li>
                                • Los niveles deben representar
                                progresión de desempeño.
                            </li>

                        </ul>

                        {/* Total niveles */}
                        <div
                            className="
                                mt-6
                                pt-4
                                border-t border-gray-100
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    uppercase
                                    text-gray-400
                                    mb-1
                                "
                            >
                                Total niveles
                            </p>

                            <p
                                className="
                                    text-2xl
                                    font-bold
                                    text-primary
                                "
                            >
                                {totalLevels}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* ================= LOADING ================= */}

            {
                loadingRubric && (

                    <div
                        className="
                            fixed inset-0
                            bg-black/10
                            backdrop-blur-sm
                            flex items-center justify-center
                            z-50
                        "
                    >

                        <div
                            className="
                                bg-white
                                px-6 py-4
                                rounded-2xl
                                shadow-lg
                                text-sm
                                text-gray-600
                            "
                        >
                            Cargando rúbrica...
                        </div>

                    </div>
                )
            }

        </div>
    );
};

export default RubricScaleDefinitionPage;