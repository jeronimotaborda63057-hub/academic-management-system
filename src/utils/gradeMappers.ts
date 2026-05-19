import type { Grade } from "../models/Grade";
import type { Evaluation } from "../models/Evaluation";
import type { Rubric } from "../models/Rubric";
import type { Subject } from "../models/Subject";
import type { Group } from "../models/Group";
import type { Teacher } from "../models/Teacher";
import type { Criteria } from "../models/Criteria";
import type { Scale } from "../models/Scale";
import type { StudentGradeSummaryRow } from "../models/StudenGradeSummaryRow";
import type { StudentGradeDetailRow } from "../models/StudentGradeDetailRow";

const OFFICIAL_STATUSES = ["SUBMITTED", "SENT"];

export const getGradeScore = (grade: Grade): number =>
    grade.final_score ?? grade.note_final ?? grade.nota_final ?? 0;

export const gradeBelongsToStudent = (grade: Grade, studentId?: string): boolean => {
    if (!studentId) return false;
    return (
        grade.student_id === studentId ||
        (grade.details?.some((detail) => detail.student_id === studentId) ?? false)
    );
};

export const buildSummaryRows = (
    grades: Grade[],
    evaluations: Evaluation[],
    rubrics: Rubric[],
    subjects: Subject[],
    groups: Group[],
    teachers: Teacher[],
    studentId?: string
): StudentGradeSummaryRow[] =>
    grades
        .filter((grade) => OFFICIAL_STATUSES.includes(grade.status ?? ""))
        .filter((grade) => gradeBelongsToStudent(grade, studentId))
        .map((grade) => {
            const evaluation =
                evaluations.find((item) => item.id === grade.evaluation_id) ??
                evaluations.find((item) => item.rubric_id === grade.rubric_id);

            const rubric = rubrics.find((item) => item.id === grade.rubric_id);
            const subject = subjects.find((item) => item.id === evaluation?.subject_id);
            const group = groups.find((item) => item.id === evaluation?.group_id);
            const teacher = teachers.find((item) => item.id === group?.teacher_id);

            return {
                evaluationName: evaluation?.name ?? "Evaluacion sin nombre",
                evaluationId: evaluation?.id,
                finalScore: getGradeScore(grade),
                grade,
                groupName: group?.name ?? group?.group_code ?? "Grupo no disponible",
                id: grade.id ?? `${grade.rubric_id}-${grade.enrollment_id}`,
                rubricTitle: rubric?.title ?? "Rubrica sin titulo",
                subjectId: subject?.id ?? "",
                subjectName: subject ? `${subject.name} (${subject.code})` : "Asignatura no disponible",
                status: grade.status ?? "SUBMITTED",
                teacherName: teacher ? `${teacher.first_name} ${teacher.last_name}` : "Docente no disponible",
                updatedAt: grade.updated_at,
            };
        });

export const buildDetailRows = (
    grade: Grade | undefined,
    criteria: Criteria[],
    scales: Scale[]
): StudentGradeDetailRow[] => {
    if (!grade?.details?.length) return [];

    return grade.details.map((detail) => {
        const scale = scales.find((item) => item.id === detail.scale_id);
        const criterion = criteria.find((item) => item.id === scale?.criterion_id);
        const criterionScales = scales.filter((item) => item.criterion_id === criterion?.id);

        const maxScaleValue = Math.max(...criterionScales.map((item) => item.value ?? 0), 100);

        return {
            comment: detail.comment,
            criterion,
            possibleScore: ((criterion?.weight ?? 0) * maxScaleValue) / 100,
            scale,
            score: detail.score ?? 0,
        };
    });
};