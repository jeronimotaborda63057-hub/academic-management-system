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

const RubricScaleDefinitionPage = () => {

    // ── Estado rúbricas ────────────────────────────────────

    const [rubrics, setRubrics] =
        useState<Rubric[]>([]);

    const [selectedRubricId, setSelectedRubricId] =
        useState<string>("");

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
        allScales,
        scales,
        loading,
        saving,
        error: scaleError,
        createScale,
        updateScale,
        deleteScale,
    } = useScaleDefinition({
        criterionId: selectedCriterion?.id,
    });

    // ── Carga inicial: todas las rúbricas ──────────────────

    useEffect(() => {
        const loadRubrics = async () => {
            try {
                const response = await rubricService.getAllWithAuth();
                setRubrics(response ?? []);
            } catch {
                setError("No fue posible cargar las rúbricas.");
            }
        };

        loadRubrics();
    }, []);

    // ── Carga criterios al cambiar rúbrica ─────────────────

    useEffect(() => {
        if (!selectedRubricId) {
            setCriteria([]);
            setSelectedCriterion(null);
            return;
        }

        const loadCriteria = async () => {
            try {
                setLoadingRubric(true);
                setError(null);

                const criteriaResponse = await criteriaService.getAll();

                const rubricCriteria = criteriaResponse.filter(
                    (criterion: Criteria) =>
                        criterion.rubric_id === selectedRubricId
                );

                setCriteria(rubricCriteria);
                setSelectedCriterion(rubricCriteria[0] ?? null);
            } catch {
                setError("No fue posible cargar los criterios.");
            } finally {
                setLoadingRubric(false);
            }
        };

        loadCriteria();
    }, [selectedRubricId]);

    // ── Eliminar nivel ─────────────────────────────────────

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
        });
    };

    // ── Derivados ──────────────────────────────────────────

    const totalLevels = useMemo(() => scales.length, [scales]);

    // ── Render ─────────────────────────────────────────────

    return (
        <div className="space-y-6">

            {/* ===== HEADER ===== */}
            <PageHeader
                title="Definir criterios y escalas"
                subtitle="Configura los niveles de desempeño asociados a cada criterio de la rúbrica."
            />

            {/* ===== SELECTOR DE RÚBRICA ===== */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <label className="text-xs uppercase text-gray-400 mb-2 block">
                    Rúbrica
                </label>
                <select
                    value={selectedRubricId}
                    onChange={(e) => setSelectedRubricId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-600 text-sm"
                >
                    <option value="">Selecciona una rúbrica</option>
                    {rubrics.map((rubric) => (
                        <option key={rubric.id} value={rubric.id}>
                            {rubric.title?? rubric.id}
                        </option>
                    ))}
                </select>
            </div>

            {/* ===== ERROR DE PÁGINA ===== */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {/* ===== CONTENIDO (solo si hay rúbrica seleccionada) ===== */}
            {selectedRubricId && (
                <div className="grid grid-cols-12 gap-6 items-start">

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
                            error={scaleError}
                            onCreate={createScale}
                            onUpdate={updateScale}
                            onDelete={handleDeleteScale}
                        />
                    </div>

                    {/* ===== COLUMNA DERECHA ===== */}
                    <div className="col-span-3 flex flex-col gap-6">
                        <ScaleSummaryCard
                            criterion={selectedCriterion || undefined}
                            scales={scales}
                        />

                        <div className="bg-white border border-gray-200 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-gray-800 mb-4">
                                Reglas
                            </h3>
                            <ul className="flex flex-col gap-3 text-sm text-gray-600">
                                <li>• Deben existir mínimo 2 niveles.</li>
                                <li>• Los nombres no pueden estar vacíos.</li>
                                <li>• Los valores deben ser únicos.</li>
                                <li>• Los niveles deben representar progresión de desempeño.</li>
                            </ul>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-xs uppercase text-gray-400 mb-1">
                                    Total niveles
                                </p>
                                <p className="text-2xl font-bold text-primary">
                                    {totalLevels}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* ===== LOADING OVERLAY ===== */}
            {loadingRubric && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-lg text-sm text-gray-600">
                        Cargando criterios...
                    </div>
                </div>
            )}

        </div>
    );
};

export default RubricScaleDefinitionPage;