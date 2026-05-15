import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import { EvaluationSidebar } from "../../components/evaluations/EvaluationSidebar";
import {
    RubricGradeTable,
    type GradeDraft,
} from "../../components/evaluations/RubricGradeTable";
import PageHeader from "../../components/ui/PageHeader";
import type { Criteria } from "../../models/Criteria";
import type { Enrollment } from "../../models/Enrollment";
import type { Evaluation } from "../../models/Evaluation";
import type { Grade } from "../../models/Grade";
import type { Scale } from "../../models/Scale";
import { criteriaService } from "../../services/criteriaService";
import { enrollmentService } from "../../services/enrollmentService";
import { evaluationService } from "../../services/evaluationService";
import { gradeService, type SaveRubricGradePayload } from "../../services/gradeService";
import { rubricService } from "../../services/rubricService";
import { scaleService } from "../../services/scaleService";

const EvaluationsPage = () => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [activeEvaluation, setActiveEvaluation] = useState<Evaluation | null>(null);
    const [selectedEvaluationId, setSelectedEvaluationId] = useState("");
    const [criteria, setCriteria] = useState<Criteria[]>([]);
    const [scales, setScales] = useState<Scale[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
    const [draft, setDraft] = useState<GradeDraft>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedEvaluation = useMemo(
        () => evaluations.find((evaluation) => evaluation.id === selectedEvaluationId),
        [evaluations, selectedEvaluationId]
    );

    const selectedEnrollment = useMemo(
        () => enrollments.find((enrollment) => enrollment.id === selectedEnrollmentId),
        [enrollments, selectedEnrollmentId]
    );

    const rubricId =
        activeEvaluation?.rubric_id ??
        activeEvaluation?.rubric?.id ??
        selectedEvaluation?.rubric_id ??
        selectedEvaluation?.rubric?.id ??
        "";

    const rubricTitle =
        activeEvaluation?.rubric?.title ??
        selectedEvaluation?.rubric?.title ??
        "Sin rubrica";

    const existingGrade = useMemo(
        () =>
            grades.find(
                (grade) =>
                    grade.enrollment_id === selectedEnrollmentId &&
                    grade.rubric_id === rubricId
            ),
        [grades, rubricId, selectedEnrollmentId]
    );

    const scalesByCriterion = useMemo(() => {
        return criteria.reduce<Record<string, Scale[]>>((acc, criterion) => {
            acc[criterion.id] = scales.filter(
                (scale) => scale.criterion_id === criterion.id
            );
            return acc;
        }, {});
    }, [criteria, scales]);

    const calculatedDetails = useMemo(() => {
        return criteria
            .map((criterion) => {
                const selectedScaleId = draft[criterion.id]?.scaleId;
                const scale = scales.find((item) => item.id === selectedScaleId);
                const score = ((scale?.value ?? 0) * (criterion.weight ?? 0)) / 100;

                return {
                    criterion,
                    scale,
                    score,
                    comment: draft[criterion.id]?.comment ?? "",
                };
            })
            .filter((detail) => detail.scale?.id);
    }, [criteria, draft, scales]);

    const finalScore = useMemo(
        () =>
            calculatedDetails.reduce(
                (total, detail) => total + detail.score,
                0
            ),
        [calculatedDetails]
    );

    const pendingCriteria = useMemo(
        () => criteria.filter((criterion) => !draft[criterion.id]?.scaleId),
        [criteria, draft]
    );

    const loadEvaluations = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await evaluationService.getAllWithRubrics();
            setEvaluations(data);

            const firstGradableEvaluation = data.find(
                (evaluation) => evaluation.rubric_id || evaluation.rubric?.id
            );

            setSelectedEvaluationId(firstGradableEvaluation?.id ?? data[0]?.id ?? "");
        } catch {
            setError("No fue posible cargar las evaluaciones.");
        } finally {
            setLoading(false);
        }
    };

    const loadGrades = async (currentRubricId: string) => {
        try {
            return await gradeService.search({ rubric_id: currentRubricId });
        } catch {
            const allGrades = await gradeService.getAllWithDetails();
            return allGrades.filter((grade) => grade.rubric_id === currentRubricId);
        }
    };

    const loadEvaluationContext = async () => {
        if (!selectedEvaluationId) return;

        try {
            setLoading(true);
            setError(null);
            setCriteria([]);
            setScales([]);
            setEnrollments([]);
            setGrades([]);
            setSelectedEnrollmentId("");
            setDraft({});
            setActiveEvaluation(null);

            const evaluation =
                (await evaluationService.getWithRubric(selectedEvaluationId)) ??
                selectedEvaluation;

            const currentRubricId = evaluation?.rubric_id ?? evaluation?.rubric?.id;

            if (!evaluation || !currentRubricId) {
                setError("La evaluacion seleccionada no tiene una rubrica asociada.");
                return;
            }

            const rubric =
                evaluation.rubric ??
                await rubricService.getByIdWithAuth(currentRubricId);
            const rubricCriteria = await criteriaService.getByRubric(currentRubricId);
            const rubricScales = await scaleService.getByCriteria(
                rubricCriteria.map((criterion) => criterion.id)
            );
            const groupEnrollments = evaluation.group_id
                ? await enrollmentService.search({
                    group_id: evaluation.group_id,
                    status: "ACTIVE",
                })
                : [];
            const rubricGrades = await loadGrades(currentRubricId);

            setActiveEvaluation({ ...evaluation, rubric: rubric ?? evaluation.rubric });
            setCriteria(rubricCriteria);
            setScales(rubricScales);
            setEnrollments(groupEnrollments);
            setGrades(rubricGrades);
            setSelectedEnrollmentId(groupEnrollments[0]?.id ?? "");
        } catch {
            setError("No fue posible cargar la rubrica o los estudiantes.");
        } finally {
            setLoading(false);
        }
    };

    const hydrateDraftFromGrade = () => {
        const nextDraft: GradeDraft = {};

        existingGrade?.details?.forEach((detail) => {
            const scale = scales.find((item) => item.id === detail.scale_id);
            if (!scale?.criterion_id || !detail.scale_id) return;

            nextDraft[scale.criterion_id] = {
                scaleId: detail.scale_id,
                comment: detail.comment ?? "",
            };
        });

        setDraft(nextDraft);
    };

    const handleScaleChange = (criterionId: string, scaleId: string) => {
        setDraft((prev) => ({
            ...prev,
            [criterionId]: {
                scaleId,
                comment: prev[criterionId]?.comment ?? "",
            },
        }));
    };

    const handleCommentChange = (criterionId: string, comment: string) => {
        setDraft((prev) => ({
            ...prev,
            [criterionId]: {
                scaleId: prev[criterionId]?.scaleId ?? "",
                comment,
            },
        }));
    };

    const buildPayload = (status: "DRAFT" | "SUBMITTED"): SaveRubricGradePayload | null => {
        if (!rubricId || !selectedEnrollment?.id) return null;

        return {
            rubric_id: rubricId,
            enrollment_id: selectedEnrollment.id,
            final_score: Number(finalScore.toFixed(2)),
            status,
            details: calculatedDetails.map((detail) => ({
                scale_id: detail.scale!.id!,
                student_id: selectedEnrollment.student_id ?? selectedEnrollment.student?.id ?? "",
                score: Number(detail.score.toFixed(2)),
                comment: detail.comment,
            })),
        };
    };

    const saveGrade = async (status: "DRAFT" | "SUBMITTED") => {
        if (!selectedEnrollment) {
            Swal.fire("Selecciona un estudiante", "Debes seleccionar un estudiante para calificar.", "warning");
            return;
        }

        if (status === "SUBMITTED" && pendingCriteria.length > 0) {
            Swal.fire(
                "Criterios pendientes",
                "Selecciona un nivel de escala para todos los criterios antes de enviar.",
                "warning"
            );
            return;
        }

        const payload = buildPayload(status);
        if (!payload) return;

        try {
            setSaving(true);

            const saved = existingGrade?.id
                ? await gradeService.updateRubricGrade(existingGrade.id, payload)
                : await gradeService.saveRubricGrade(payload);

            if (!saved) throw new Error();

            const updatedGrades = await loadGrades(rubricId);
            setGrades(updatedGrades);

            Swal.fire({
                title: status === "DRAFT" ? "Borrador guardado" : "Calificacion enviada",
                icon: "success",
                timer: 1600,
                showConfirmButton: false,
            });
        } catch {
            Swal.fire("Error", "No fue posible guardar la calificacion.", "error");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        loadEvaluations();
    }, []);

    useEffect(() => {
        loadEvaluationContext();
    }, [selectedEvaluationId]);

    useEffect(() => {
        hydrateDraftFromGrade();
    }, [existingGrade?.id, scales.length, selectedEnrollmentId]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Evaluaciones"
                subtitle="Califica estudiantes con la rubrica asociada."
                breadcrumb={["Inicio", "Evaluaciones"]}
            />

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
                <EvaluationSidebar
                    evaluations={evaluations}
                    enrollments={enrollments}
                    selectedEvaluationId={selectedEvaluationId}
                    selectedEnrollmentId={selectedEnrollmentId}
                    rubricTitle={rubricTitle}
                    existingGrade={existingGrade}
                    selectedEnrollment={selectedEnrollment}
                    onEvaluationChange={setSelectedEvaluationId}
                    onEnrollmentChange={setSelectedEnrollmentId}
                />

                <RubricGradeTable
                    criteria={criteria}
                    draft={draft}
                    finalScore={finalScore}
                    loading={loading}
                    saving={saving}
                    scales={scales}
                    scalesByCriterion={scalesByCriterion}
                    selectedEnrollment={selectedEnrollment}
                    selectedEnrollmentId={selectedEnrollmentId}
                    onScaleChange={handleScaleChange}
                    onCommentChange={handleCommentChange}
                    onSaveDraft={() => saveGrade("DRAFT")}
                    onSubmitGrade={() => saveGrade("SUBMITTED")}
                />
            </div>
        </div>
    );
};

export default EvaluationsPage;
