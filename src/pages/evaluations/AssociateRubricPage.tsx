import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import RubricAssociationTable from "../../components/evaluations/RubricAssociationTable";

import { evaluationRubricService } from "../../services/evaluationRubricService";

import type { Rubric } from "../../models/Rubric";
import type { Subject } from "../../models/Subject";

export default function AssociateRubricPage() {

    const navigate = useNavigate();

    const [loading, setLoading] =
        useState<boolean>(true);

    const [evaluations, setEvaluations] =
        useState<any[]>([]);

    const [rubrics, setRubrics] =
        useState<Rubric[]>([]);

    const [subjects, setSubjects] =
        useState<Subject[]>([]);

    const [groups, setGroups] =
        useState<any[]>([]);

    const [selectedEvaluation, setSelectedEvaluation] =
        useState<any | null>(null);

    const [selectedSubjectId, setSelectedSubjectId] =
        useState<string>("");

    const [selectedGroupId, setSelectedGroupId] =
        useState<string>("");

    const [selectedRubric, setSelectedRubric] =
        useState<Rubric | null>(null);

    // ─────────────────────────────────────────────
    // LOAD INITIAL DATA
    // ─────────────────────────────────────────────

    useEffect(() => {

        const loadInitialData = async () => {

            try {

                const [
                    rubricsData,
                    subjectsData,
                    groupsData,
                    evaluationsData
                ] = await Promise.all([
                    evaluationRubricService.getPublishedRubrics(),
                    evaluationRubricService.getSubjects(),
                    evaluationRubricService.getGroups(),
                    evaluationRubricService.getAllEvaluations()
                ]);

                setRubrics(rubricsData || []);
                setSubjects(subjectsData || []);
                setEvaluations(evaluationsData || []);

                if (Array.isArray(groupsData)) {

                    setGroups(groupsData);

                } else if (
                    groupsData &&
                    typeof groupsData === "object" &&
                    "data" in groupsData &&
                    Array.isArray((groupsData as any).data)
                ) {

                    setGroups((groupsData as any).data);

                } else {

                    setGroups([]);
                }

            } catch (error) {

                console.error(error);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        "No se pudieron cargar los catálogos."
                });

            } finally {

                setLoading(false);
            }
        };

        loadInitialData();

    }, []);

    // ─────────────────────────────────────────────
    // RESET
    // ─────────────────────────────────────────────

    const resetFlowStates = () => {

        setSelectedEvaluation(null);

        setSelectedSubjectId("");

        setSelectedGroupId("");

        setSelectedRubric(null);
    };

    // ─────────────────────────────────────────────
    // STEP 1
    // ─────────────────────────────────────────────

    const onEvaluationChange = async (
        e: ChangeEvent<HTMLSelectElement>
    ) => {

        const value = e.target.value;

        if (!value) {

            resetFlowStates();

            return;
        }

        setLoading(true);

        try {

            const response =
                await evaluationRubricService.getEvaluation(value);

            const evaluation =
                response?.data || response;

            if (!evaluation) {

                throw new Error(
                    "Evaluación inválida"
                );
            }

            setSelectedEvaluation(evaluation);

            const targetGroupId =
                evaluation.group_id ??
                evaluation.id_group;

            if (targetGroupId && groups.length > 0) {

                const currentGroup =
                    groups.find((g) => {

                        const gId =
                            g.id ??
                            g.group_id ??
                            g.id_group;

                        return (
                            String(gId) ===
                            String(targetGroupId)
                        );
                    });

                if (currentGroup) {

                    const subjectId =
                        currentGroup.subject_id ??
                        currentGroup.id_subject ??
                        currentGroup.subject?.id;

                    setSelectedSubjectId(
                        subjectId
                            ? String(subjectId)
                            : ""
                    );

                    setSelectedGroupId(
                        String(targetGroupId)
                    );
                }
            }

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    "No se pudo cargar la evaluación."
            });

        } finally {

            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────
    // STEP 3
    // ─────────────────────────────────────────────

    const onSubjectChange = (
        e: ChangeEvent<HTMLSelectElement>
    ) => {

        const subId = e.target.value;

        setSelectedSubjectId(subId);

        setSelectedRubric(null);

        if (!subId) {

            setSelectedGroupId("");

            return;
        }

        const validGroup =
            groups.find((g) => {

                const groupSubjectId =
                    g.subject_id ??
                    g.id_subject ??
                    g.subject?.id;

                return (
                    String(groupSubjectId) ===
                    String(subId)
                );
            });

        if (validGroup) {

            const gId =
                validGroup.id ??
                validGroup.group_id ??
                validGroup.id_group;

            setSelectedGroupId(String(gId));

        } else {

            setSelectedGroupId("");

            Swal.fire({
                icon: "warning",
                title: "Sin grupo",
                text:
                    "No existe grupo asociado a la asignatura."
            });
        }
    };

    // ─────────────────────────────────────────────
    // STEP 5
    // ─────────────────────────────────────────────

    const handleAssociate = async () => {

        if (!selectedEvaluation) {

            Swal.fire({
                icon: "warning",
                title: "Evaluación requerida",
                text:
                    "Debe seleccionar una evaluación."
            });

            return;
        }

        if (!selectedSubjectId || !selectedGroupId) {

            Swal.fire({
                icon: "warning",
                title: "Asignatura requerida",
                text:
                    "Debe seleccionar una asignatura válida."
            });

            return;
        }

        if (!selectedRubric) {

            Swal.fire({
                icon: "warning",
                title: "Rúbrica requerida",
                text:
                    "Debe seleccionar una rúbrica."
            });

            return;
        }

        const evaluationId =
            selectedEvaluation.id ??
            selectedEvaluation.evaluation_id ??
            selectedEvaluation.id_evaluation;

        const rubricId =
            selectedRubric.id ??
            (selectedRubric as any).rubric_id ??
            (selectedRubric as any).id_rubric;

        if (!evaluationId || !rubricId) {

            Swal.fire({
                icon: "error",
                title: "Datos inválidos",
                text:
                    "No se pudo construir la asociación."
            });

            return;
        }

        try {

            setLoading(true);

            await evaluationRubricService.associate(

                String(evaluationId),

                String(selectedSubjectId),

                String(selectedGroupId),

                String(rubricId),

                selectedEvaluation.name || "Evaluación",

                selectedEvaluation.description || "",

                Number(selectedEvaluation.weight || 0)
            );

            await Swal.fire({
                icon: "success",
                title: "Asociación Exitosa",
                text:
                    "La evaluación fue actualizada correctamente."
            });

            navigate('/rubrics/associate');

        } catch (error: any) {

            console.error(error);

            const backendMessage =
                error?.response?.data?.message;

            Swal.fire({
                icon: "error",
                title: "Operación bloqueada",
                text:
                    backendMessage ||
                    "No fue posible actualizar la evaluación."
            });

        } finally {

            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────
    // LOADING
    // ─────────────────────────────────────────────

    if (loading) {

        return (
            <div className="rounded-2xl border bg-white p-6 text-sm text-gray-500">
                Procesando...
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────

    return (

        <div className="space-y-6">

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="mb-6 border-b border-gray-100 pb-4">

                    <h1 className="text-2xl font-bold text-gray-900">
                        Asociar rúbrica a asignatura
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Flujo interactivo estricto para gestión de rúbricas.
                    </p>
                </div>

                {/* STEP 1 */}

                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/50 p-5">

                    <label className="mb-2 block text-sm font-semibold text-blue-900">
                        Paso 1: Seleccione la evaluación
                    </label>

                    <select
                        onChange={onEvaluationChange}
                        value={
                            selectedEvaluation?.id ??
                            selectedEvaluation?.evaluation_id ??
                            selectedEvaluation?.id_evaluation ??
                            ""
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-primary"
                    >

                        <option value="">
                            -- Seleccionar Evaluación --
                        </option>

                        {evaluations.map((ev) => {

                            const evId =
                                ev.id ??
                                ev.evaluation_id ??
                                ev.id_evaluation;

                            return (
                                <option
                                    key={evId}
                                    value={evId}
                                >
                                    {ev.name} ({ev.weight}%)
                                </option>
                            );
                        })}
                    </select>
                </div>

                {selectedEvaluation && (

                    <div className="space-y-6">

                        {/* STEP 3 */}

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Paso 3: Cambiar asignatura destino
                            </label>

                            <select
                                value={selectedSubjectId}
                                onChange={onSubjectChange}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
                            >

                                <option value="">
                                    -- Seleccionar Asignatura --
                                </option>

                                {subjects.map((subject) => {

                                    const subId =
                                        subject.id ??
                                        (subject as any).subject_id ??
                                        (subject as any).id_subject;

                                    return (
                                        <option
                                            key={subId}
                                            value={subId}
                                        >
                                            {subject.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* STEP 4 */}

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Paso 4: Seleccione una rúbrica pública
                            </label>

                            {rubrics.length === 0 && (
                                <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                                    No existen rúbricas públicas disponibles.
                                    Debe crear o publicar una rúbrica desde CU-07.
                                </div>
                            )}

                            <RubricAssociationTable
                                rubrics={rubrics}
                                selectedRubric={selectedRubric}
                                onSelect={setSelectedRubric}
                            />
                        </div>

                        {/* STEP 5 */}

                        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">

                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="rounded-xl border px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleAssociate}
                                disabled={!selectedRubric}
                                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Confirmar Asociación
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}