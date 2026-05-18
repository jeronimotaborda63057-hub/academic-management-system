import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import type { Criteria } from "../models/uml/Criteria";
import type { Evaluation } from "../models/uml/Evaluation";
import type { Grade } from "../models/uml/Grade";
import type { Group } from "../models/uml/Group";
import type { Rubric } from "../models/uml/Rubric";
import type { Scale } from "../models/uml/Scale";
import type { Subject } from "../models/uml/Subject";
import type { Teacher } from "../models/uml/Teacher";
import type { RootState } from "../store/store";
import type {
    StudentGradeContext,
} from "../models/interfaces/StudenGradeContext";
import type {
    StudentGradeDetailRow,
} from "../models/interfaces/StudentGradeDetailRow";
import type {
    StudentGradeSummaryRow,
} from "../models/interfaces/StudenGradeSummaryRow";
import { criteriaService } from "../services/criteriaService";
import { evaluationService } from "../services/evaluationService";
import { gradeService } from "../services/gradeService";
import { groupService } from "../services/groupService";
import { rubricService } from "../services/rubricService";
import { scaleService } from "../services/scaleService";
import { subjectService } from "../services/subjectService";
import { teacherService } from "../services/teacherService";

const gradeBelongsToStudent = (grade: Grade, studentId?: string) => {
    if (!studentId) return true;

    return grade.student_id === studentId ||
        grade.details?.some((detail) => detail.student_id === studentId);
};

const getGradeScore = (grade: Grade) =>
    grade.final_score ?? grade.note_final ?? grade.nota_final ?? 0;

const buildSummaryRows = (
    grades: Grade[],
    evaluations: Evaluation[],
    rubrics: Rubric[],
    subjects: Subject[],
    groups: Group[],
    teachers: Teacher[],
    studentId?: string
): StudentGradeSummaryRow[] =>
    grades
        .filter((grade) => grade.status === "SUBMITTED")
        .filter((grade) => gradeBelongsToStudent(grade, studentId))
        .map((grade) => {
            const evaluation = evaluations.find(
                (item) => item.rubric_id === grade.rubric_id
            );
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
                subjectName: subject
                    ? `${subject.name} (${subject.code})`
                    : "Asignatura no disponible",
                status: grade.status ?? "SUBMITTED",
                teacherName: teacher
                    ? `${teacher.first_name} ${teacher.last_name}`
                    : "Docente no disponible",
                updatedAt: grade.updated_at,
            };
        });

const buildDetailRows = (
    grade: Grade | undefined,
    criteria: Criteria[],
    scales: Scale[]
): StudentGradeDetailRow[] => {
    if (!grade?.details) return [];

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

export const useStudentGradeDetails = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const currentStudentId = user?.role === "STUDENT" ? user.profile?.id : undefined;

    const [grades, setGrades] = useState<Grade[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [rubrics, setRubrics] = useState<Rubric[]>([]);
    const [criteria, setCriteria] = useState<Criteria[]>([]);
    const [scales, setScales] = useState<Scale[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedGradeId, setSelectedGradeId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const gradeRows = useMemo(
        () => buildSummaryRows(
            grades,
            evaluations,
            rubrics,
            subjects,
            groups,
            teachers,
            currentStudentId
        ),
        [currentStudentId, evaluations, grades, groups, rubrics, subjects, teachers]
    );

    const selectedRow = useMemo(
        () => gradeRows.find((row) => row.id === selectedGradeId) ?? gradeRows[0],
        [gradeRows, selectedGradeId]
    );

    const selectedGrade = selectedRow?.grade;

    const selectedContext = useMemo<StudentGradeContext>(() => {
        const evaluation = evaluations.find(
            (item) => item.rubric_id === selectedGrade?.rubric_id
        );
        const rubric = rubrics.find((item) => item.id === selectedGrade?.rubric_id);
        const subject = subjects.find((item) => item.id === evaluation?.subject_id);
        const group = groups.find((item) => item.id === evaluation?.group_id);
        const teacher = teachers.find((item) => item.id === group?.teacher_id);

        return {
            evaluation,
            grade: selectedGrade,
            group,
            rubric,
            subject,
            teacher,
        };
    }, [evaluations, groups, rubrics, selectedGrade, subjects, teachers]);

    const detailRows = useMemo(
        () => buildDetailRows(selectedGrade, criteria, scales),
        [criteria, scales, selectedGrade]
    );

    const loadGradeDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                gradeData,
                evaluationData,
                rubricData,
                criteriaData,
                scaleData,
                groupData,
                subjectData,
                teacherData,
            ] = await Promise.all([
                gradeService.getAllWithDetails(),
                evaluationService.getAllWithRubrics(),
                rubricService.getAllWithAuth(),
                criteriaService.getAllWithAuth(),
                scaleService.getAllWithAuth(),
                groupService.getAllWithAuth(),
                subjectService.getAllWithAuth(),
                teacherService.getAllWithAuth(),
            ]);

            setGrades(gradeData);
            setEvaluations(evaluationData);
            setRubrics(rubricData);
            setCriteria(criteriaData);
            setScales(scaleData);
            setGroups(groupData);
            setSubjects(subjectData);
            setTeachers(teacherData);
        } catch {
            setError("No fue posible cargar las calificaciones detalladas.");
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        if (!selectedGrade) return;

        const header = ["criterio", "peso", "nivel", "puntaje", "comentario"];
        const body = detailRows.map((row) => [
            row.criterion?.name ?? "",
            String(row.criterion?.weight ?? 0),
            row.scale?.name ?? "",
            row.score.toFixed(2),
            row.comment ?? "",
        ]);
        const summary = [
            ["evaluacion", selectedContext.evaluation?.name ?? ""],
            ["rubrica", selectedContext.rubric?.title ?? ""],
            ["nota_final", getGradeScore(selectedGrade).toFixed(2)],
            ["observaciones", selectedGrade.observations ?? ""],
        ];
        const csv = [...summary, [], header, ...body]
            .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "reporte-desempeno.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        loadGradeDetails();
    }, []);

    useEffect(() => {
        if (!selectedGradeId && gradeRows[0]?.id) {
            setSelectedGradeId(gradeRows[0].id);
        }
    }, [gradeRows, selectedGradeId]);

    return {
        detailRows,
        downloadReport,
        error,
        gradeRows,
        loading,
        selectedContext,
        selectedGradeId,
        setSelectedGradeId,
    };
};
