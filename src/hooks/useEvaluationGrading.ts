import { useEffect, useMemo, useState } from "react";

import type { Criteria } from "../models/Criteria";
import type { Evaluation } from "../models/Evaluation";
import type { Grade } from "../models/Grade";
import type { Registration } from "../models/Registration";
import type { Rubric } from "../models/Rubric";
import type { Scale } from "../models/Scale";
import type { Student } from "../models/Student";
import type { GradeDraft, GradingStudent } from "../models/GradingStudent";
import { criteriaService } from "../services/criteriaService";
import { evaluationService } from "../services/evaluationService";
import { gradeService, type SaveRubricGradePayload } from "../services/gradeService";
import { registrationService } from "../services/registrationService";
import { rubricService } from "../services/rubricService";
import { scaleService } from "../services/scaleService";
import { studentService } from "../services/studentService";

const findGradeForStudent = (grades: Grade[], studentId: string) =>
    grades.find((grade) =>
        grade.student_id === studentId ||
        grade.details?.some((detail) => detail.student_id === studentId)
    );

const buildGradingStudents = (
    registrations: Registration[],
    students: Student[],
    grades: Grade[]
): GradingStudent[] => {
    return registrations.map((registration) => {
        const student = students.find((item) => item.id === registration.student_id);
        const grade = registration.student_id
            ? findGradeForStudent(grades, registration.student_id)
            : undefined;

        return {
            enrollmentId: grade?.enrollment_id ?? registration.id ?? "",
            registration,
            student,
            studentId: registration.student_id ?? "",
            grade,
        };
    }).filter((item) => item.enrollmentId && item.studentId);
};

export const useEvaluationGrading = () => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [activeEvaluation, setActiveEvaluation] = useState<Evaluation | null>(null);
    const [selectedEvaluationId, setSelectedEvaluationId] = useState("");
    const [criteria, setCriteria] = useState<Criteria[]>([]);
    const [scales, setScales] = useState<Scale[]>([]);
    const [students, setStudents] = useState<GradingStudent[]>([]);
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

    const selectedStudent = useMemo(
        () => students.find((student) => student.enrollmentId === selectedEnrollmentId),
        [selectedEnrollmentId, students]
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
            selectedStudent?.grade ??
            grades.find((grade) =>
                grade.enrollment_id === selectedEnrollmentId ||
                grade.details?.some((detail) => detail.student_id === selectedStudent?.studentId)
            ),
        [grades, selectedEnrollmentId, selectedStudent]
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
        () => calculatedDetails.reduce((total, detail) => total + detail.score, 0),
        [calculatedDetails]
    );

    const pendingCriteria = useMemo(
        () => criteria.filter((criterion) => !draft[criterion.id]?.scaleId),
        [criteria, draft]
    );

    const loadGrades = async (currentRubricId: string) => {
        try {
            return await gradeService.search({ rubric_id: currentRubricId });
        } catch {
            const allGrades = await gradeService.getAllWithDetails();
            return allGrades.filter((grade) => grade.rubric_id === currentRubricId);
        }
    };

    const loadEvaluations = async () => {
        try {
            setLoading(true);
            setError(null);

            const [evaluationData, rubricData] = await Promise.all([
                evaluationService.getAllWithRubrics(),
                rubricService.getAllWithAuth(),
            ]);

            const evaluationsWithRubrics = evaluationData.map((evaluation) => ({
                ...evaluation,
                rubric: rubricData.find((rubric) => rubric.id === evaluation.rubric_id),
            }));

            setEvaluations(evaluationsWithRubrics);

            const firstGradableEvaluation = evaluationsWithRubrics.find(
                (evaluation) => evaluation.rubric_id || evaluation.rubric?.id
            );

            setSelectedEvaluationId(firstGradableEvaluation?.id ?? evaluationsWithRubrics[0]?.id ?? "");
        } catch {
            setError("No fue posible cargar las evaluaciones.");
        } finally {
            setLoading(false);
        }
    };

    const loadEvaluationContext = async () => {
        if (!selectedEvaluationId) return;

        try {
            setLoading(true);
            setError(null);
            setCriteria([]);
            setScales([]);
            setStudents([]);
            setGrades([]);
            setSelectedEnrollmentId("");
            setDraft({});
            setActiveEvaluation(null);

            const evaluation = selectedEvaluation;
            const currentRubricId = evaluation?.rubric_id ?? evaluation?.rubric?.id;

            if (!evaluation || !currentRubricId) {
                setError("La evaluacion seleccionada no tiene una rubrica asociada.");
                return;
            }

            const [
                rubricData,
                rubricCriteria,
                activeRegistrations,
                studentData,
                rubricGrades,
            ] = await Promise.all([
                rubricService.getAllWithAuth(),
                criteriaService.getByRubric(currentRubricId),
                registrationService.getActiveStudents(),
                studentService.getAllWithAuth(),
                loadGrades(currentRubricId),
            ]);

            const rubric = rubricData.find((item: Rubric) => item.id === currentRubricId);
            const rubricScales = await scaleService.getByCriteria(
                rubricCriteria.map((criterion) => criterion.id)
            );
            const gradingStudents = buildGradingStudents(
                activeRegistrations,
                studentData,
                rubricGrades
            );

            setActiveEvaluation({ ...evaluation, rubric: rubric ?? evaluation.rubric });
            setCriteria(rubricCriteria);
            setScales(rubricScales);
            setStudents(gradingStudents);
            setGrades(rubricGrades);
            setSelectedEnrollmentId(gradingStudents[0]?.enrollmentId ?? "");
        } catch {
            setError("No fue posible cargar la rubrica, criterios, escalas o estudiantes.");
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
        if (!rubricId || !selectedStudent) return null;

        return {
            rubric_id: rubricId,
            enrollment_id: selectedStudent.enrollmentId,
            final_score: Number(finalScore.toFixed(2)),
            status,
            details: calculatedDetails.map((detail) => ({
                scale_id: detail.scale!.id!,
                student_id: selectedStudent.studentId,
                score: Number(detail.score.toFixed(2)),
                comment: detail.comment,
            })),
        };
    };

    const saveGrade = async (status: "DRAFT" | "SUBMITTED") => {
        const payload = buildPayload(status);
        if (!payload) return null;

        setSaving(true);

        try {
            const saved = existingGrade?.id
                ? await gradeService.updateRubricGrade(existingGrade.id, payload)
                : await gradeService.saveRubricGrade(payload);

            if (!saved) throw new Error();

            const updatedGrades = await loadGrades(rubricId);
            const updatedStudents = students.map((student) => ({
                ...student,
                grade: findGradeForStudent(updatedGrades, student.studentId),
            }));

            setGrades(updatedGrades);
            setStudents(updatedStudents);
            return saved;
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

    return {
        criteria,
        draft,
        error,
        evaluations,
        existingGrade,
        finalScore,
        loading,
        pendingCriteria,
        rubricTitle,
        saveGrade,
        saving,
        scales,
        scalesByCriterion,
        selectedEnrollmentId,
        selectedEvaluationId,
        selectedStudent,
        setSelectedEnrollmentId,
        setSelectedEvaluationId,
        students,
        updateComment: handleCommentChange,
        updateScale: handleScaleChange,
    };
};
