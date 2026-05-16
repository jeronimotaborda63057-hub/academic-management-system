import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import type { Criteria } from "../../models/Criteria";
import type { Rubric } from "../../models/Rubric";

import { rubricService } from "../../services/rubricService";
import { criteriaService } from "../../services/criteriaService";

import { useScaleDefinition } from "../../hooks/useScaleDefinition";

import PageHeader from "../../components/ui/PageHeader";

import { CriteriaSidebar } from "../../components/scales/CriteriaSidebar";
import { ScaleSummaryCard } from "../../components/scales/ScaleSummaryCard";

import { ScaleLevelsTableContainer } from "../../components/scales/ScaleLevelsTableContainer";

// ─────────────────────────────────────────────────────────────
//  Constante — ID rúbrica activa
//  (en un sistema real vendría de useParams o del store)
// ─────────────────────────────────────────────────────────────

const RUBRIC_ID = "8d50acfb-cc75-4b6f-b6ee-b3785842d9f0";

// ─────────────────────────────────────────────────────────────
//  RubricScaleDefinitionPage
//
//  SRP  → coordina flujo, side effects y composición.
//          No renderiza tablas complejas ni lógica de UI.
//  OCP  → secciones extendibles via nuevos sub-componentes.
//  LSP  → sub-componentes son intercambiables por otros que
//          respeten la misma interfaz de props.
//  ISP  → cada sub-componente recibe solo sus props relevantes.
//  DIP  → depende de servicios/hooks (abstracciones), no de
//          implementaciones de fetch directas.
// ─────────────────────────────────────────────────────────────

const RubricScaleDefinitionPage = () => {

    // ── Estado rúbrica ─────────────────────────────────────

    const [_rubric, setRubric] =
        useState<Rubric | null>(null);

    const [criteria, setCriteria] =
        useState<Criteria[]>([]);

    const [loadingRubric, setLoadingRubric] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    // ── Criterio seleccionado ──────────────────────────────

    const [selectedCriterion, setSelectedCriterion] =
        useState<Criteria | null>(null);

    // ── Hook escalas ──────────────────────────────────────

    const {
        allScales,      // ← nuevo
        scales,
        loading,
        saving,
        createScale,
        updateScale,
        deleteScale,
    } = useScaleDefinition({
        criterionId: selectedCriterion?.id,
    });

    // ── Carga inicial ──────────────────────────────────────

    const loadRubric = async () => {

        try {

            setLoadingRubric(true);
            setError(null);

            const rubricResponse =
                await rubricService.getById(RUBRIC_ID);

            if (!rubricResponse) return;

            setRubric(rubricResponse);

            const criteriaResponse =
                await criteriaService.getAll();

            const rubricCriteria = criteriaResponse.filter(
                (criterion: Criteria) =>
                    criterion.rubric_id === rubricResponse.id
            );

            setCriteria(rubricCriteria);

            if (rubricCriteria.length > 0) {
                setSelectedCriterion(rubricCriteria[0]);
            }

        } catch {

            setError("No fue posible cargar la rúbrica.");

        } finally {

            setLoadingRubric(false);
        }
    };

    // ── Eliminar nivel ─────────────────────────────────────

    /**
     * SRP: la página gestiona confirmaciones y notificaciones.
     * ScaleLevelsTable solo emite el evento.
     */
    const handleDeleteScale = async (id: string) => {

        const result = await Swal.fire({
            title: "¿Eliminar nivel?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc2626",
        });

        if (!result.isConfirmed) return;

        await deleteScale(id);

        await Swal.fire({
            title: "Nivel eliminado",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: {
                confirmButton: "swal-confirm-btn",
            },
        });
    };

    // ── Derivados ──────────────────────────────────────────

    const totalLevels = useMemo(() => scales.length, [scales]);

    // ── Efecto inicial ─────────────────────────────────────

    useEffect(() => {
        loadRubric();
    }, []);

    // ── Render ─────────────────────────────────────────────

    return (

        <div className="space-y-6">

            {/* ===== HEADER ===== */}
            <PageHeader
                title="Definir criterios y escalas"
                subtitle="
                    Configura los niveles de desempeño
                    asociados a cada criterio de la rúbrica.
                "
            />

            {/* ===== ERROR ===== */}
            {error && (
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
            )}

            {/* ===== GRID PRINCIPAL ===== */}
            <div
                className="
                    grid grid-cols-12
                    gap-6
                    items-start
                "
            >

                {/* ===== SIDEBAR (criterios) ===== */}
                <div className="col-span-3">
                    <CriteriaSidebar
                        criteria={criteria}
                        selectedCriterionId={selectedCriterion?.id}
                        onSelectCriterion={setSelectedCriterion}
                    />
                </div>

                {/* ===== TABLA NIVELES ===== */}
                <div className="col-span-6">
                    <ScaleLevelsTableContainer
                        criterionId={selectedCriterion?.id ?? ""}
                        allScales={allScales}
                        scales={scales}
                        loading={loading}
                        saving={saving}
                        onCreate={createScale}
                        onUpdate={updateScale}
                        onDelete={handleDeleteScale}
                    />
                </div>

                {/* ===== COLUMNA DERECHA ===== */}
                <div className="col-span-3 flex flex-col gap-6">
                    {/* Resumen criterio */}
                    <ScaleSummaryCard
                        criterion={selectedCriterion || undefined}
                        scales={scales}
                    />

                    {/* ── Reglas / total niveles ── */}
                    <div
                        className="
                            bg-white
                            border border-gray-200
                            rounded-2xl
                            p-5
                        "
                    >

                        <h3
                            className="
                                text-sm font-semibold
                                text-gray-800 mb-4
                            "
                        >
                            Reglas
                        </h3>

                        <ul
                            className="
                                flex flex-col gap-3
                                text-sm text-gray-600
                            "
                        >
                            <li>• Deben existir mínimo 2 niveles.</li>
                            <li>• Los nombres no pueden estar vacíos.</li>
                            <li>• Los valores deben ser únicos.</li>
                            <li>
                                • Los niveles deben representar
                                progresión de desempeño.
                            </li>
                        </ul>

                        {/* Total niveles */}
                        <div
                            className="
                                mt-6 pt-4
                                border-t border-gray-100
                            "
                        >
                            <p
                                className="
                                    text-xs uppercase
                                    text-gray-400 mb-1
                                "
                            >
                                Total niveles
                            </p>
                            <p
                                className="
                                    text-2xl font-bold
                                    text-primary
                                "
                            >
                                {totalLevels}
                            </p>
                        </div>

                    </div>

                </div>

            </div>

            {/* ===== LOADING OVERLAY ===== */}
            {loadingRubric && (
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
                            text-sm text-gray-600
                        "
                    >
                        Cargando rúbrica...
                    </div>
                </div>
            )}

        </div>
    );
};

export default RubricScaleDefinitionPage;
