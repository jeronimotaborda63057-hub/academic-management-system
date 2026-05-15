import { useEffect, useMemo, useState } from "react";

import type { Evaluation } from "../models/Evaluation";
import type { Grade } from "../models/Grade";
import type { Group } from "../models/Group";
import type { Registration } from "../models/Registration";
import type { Semester } from "../models/Semester";
import type { Student } from "../models/Student";
import type { FinalGradeRow } from "../components/grades/types";
import { evaluationService } from "../services/evaluationService";
import { gradeService } from "../services/gradeService";
import { groupService } from "../services/groupService";
import { registrationService } from "../services/registrationService";
import { semesterService } from "../services/semesterService";
import { studentService } from "../services/studentService";

const gradeBelongsToStudent = (grade: Grade, studentId: string) =>
    grade.student_id === studentId ||
    grade.details?.some((detail) => detail.student_id === studentId);

const findStudentGradeForEvaluation = (
    grades: Grade[],
    studentId: string,
    evaluation: Evaluation
) =>
    grades.find(
        (grade) =>
            grade.rubric_id === evaluation.rubric_id &&
            gradeBelongsToStudent(grade, studentId)
    );

const getGradeScore = (grade?: Grade) =>
    grade?.final_score ?? grade?.note_final ?? grade?.nota_final ?? 0;

const buildRows = (
    registrations: Registration[],
    students: Student[],
    grades: Grade[],
    evaluations: Evaluation[]
): FinalGradeRow[] =>
    registrations
        .filter((registration) => registration.student_id)
        .map((registration) => {
            const studentId = registration.student_id!;
            const student = students.find((item) => item.id === studentId);
            const studentGrades = evaluations
                .map((evaluation) =>
                    findStudentGradeForEvaluation(grades, studentId, evaluation)
                )
                .filter((grade): grade is Grade => Boolean(grade));
            const submittedGrades = evaluations
                .map((evaluation) => ({
                    evaluation,
                    grade: findStudentGradeForEvaluation(grades, studentId, evaluation),
                }))
                .filter(({ grade }) => grade?.status === "SUBMITTED");
            const incompleteEvaluations = evaluations.filter((evaluation) => {
                const grade = findStudentGradeForEvaluation(grades, studentId, evaluation);
                return grade?.status !== "SUBMITTED";
            });
            const finalScore = submittedGrades.reduce(
                (total, { evaluation, grade }) =>
                    total + getGradeScore(grade) * ((evaluation.weight ?? 0) / 100),
                0
            );

            return {
                completedEvaluations: submittedGrades.length,
                finalScore,
                grades: studentGrades,
                incompleteEvaluations,
                isComplete: incompleteEvaluations.length === 0 && evaluations.length > 0,
                isLocked: studentGrades.length > 0 && studentGrades.every((grade) => grade.is_locked),
                registration,
                student,
                studentId,
            };
        });

export const useFinalGrades = () => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeSemester = useMemo(
        () => semesters.find((semester) => semester.is_active),
        [semesters]
    );

    const activeGroups = useMemo(() => {
        const semesterGroups = groups.filter(
            (group) => group.semester_id === activeSemester?.id
        );

        return semesterGroups.length > 0 ? semesterGroups : groups;
    }, [activeSemester?.id, groups]);

    const selectedGroup = useMemo(
        () => activeGroups.find((group) => group.id === selectedGroupId),
        [activeGroups, selectedGroupId]
    );

    const selectedGroupSemesterIsActive = Boolean(
        activeSemester?.id &&
        selectedGroup?.semester_id &&
        selectedGroup.semester_id === activeSemester.id
    );

    const groupEvaluations = useMemo(
        () => evaluations.filter((evaluation) => evaluation.group_id === selectedGroupId),
        [evaluations, selectedGroupId]
    );

    const rows = useMemo(
        () => buildRows(registrations, students, grades, groupEvaluations),
        [groupEvaluations, grades, registrations, students]
    );

    const summary = useMemo(
        () => ({
            completeCount: rows.filter((row) => row.isComplete).length,
            evaluationCount: groupEvaluations.length,
            incompleteCount: rows.filter((row) => !row.isComplete).length,
            lockedCount: rows.filter((row) => row.isLocked).length,
            studentCount: rows.length,
        }),
        [groupEvaluations.length, rows]
    );

    const loadFinalGrades = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                semesterData,
                groupData,
                evaluationData,
                gradeData,
                registrationData,
                studentData,
            ] = await Promise.all([
                semesterService.getAllWithAuth(),
                groupService.getAllWithAuth(),
                evaluationService.getAllWithRubrics(),
                gradeService.getAllWithDetails(),
                registrationService.getActiveStudents(),
                studentService.getAllWithAuth(),
            ]);

            const currentSemester = semesterData.find((semester) => semester.is_active);
            const semesterGroups = groupData.filter(
                (group) => group.semester_id === currentSemester?.id
            );
            const selectableGroups = semesterGroups.length > 0
                ? semesterGroups
                : groupData;

            setSemesters(semesterData);
            setGroups(groupData);
            setEvaluations(evaluationData);
            setGrades(gradeData);
            setRegistrations(registrationData);
            setStudents(studentData);
            setSelectedGroupId((current) => current || (selectableGroups[0]?.id ?? ""));

            if (!currentSemester) {
                setError("No hay un semestre activo. No se pueden registrar notas oficiales.");
            }
        } catch {
            setError("No fue posible cargar el consolidado de notas finales.");
        } finally {
            setLoading(false);
        }
    };

    const finalizeOfficialGrades = async () => {
        setSaving(true);

        try {
            const updates = rows.flatMap((row) => {
                const observations = row.isComplete
                    ? undefined
                    : `Nota final parcial. Faltan ${row.incompleteEvaluations.length} evaluacion(es).`;

                return row.grades
                    .filter((grade) => grade.id && !grade.is_locked)
                    .map((grade) =>
                        gradeService.finalizeGrade(grade.id!, {
                            is_locked: true,
                            observations,
                            status: "SUBMITTED",
                        })
                    );
            });

            await Promise.all(updates);
            const updatedGrades = await gradeService.getAllWithDetails();
            setGrades(updatedGrades);
        } finally {
            setSaving(false);
        }
    };

    const downloadReport = () => {
        const header = [
            "student_id",
            "identification",
            "student_name",
            "completed_evaluations",
            "missing_evaluations",
            "final_score",
            "status",
        ];
        const body = rows.map((row) => {
            const name = [row.student?.first_name, row.student?.last_name]
                .filter(Boolean)
                .join(" ");

            return [
                row.studentId,
                row.student?.identification ?? "",
                name,
                String(row.completedEvaluations),
                String(row.incompleteEvaluations.length),
                row.finalScore.toFixed(2),
                row.isLocked ? "OFFICIAL" : row.isComplete ? "READY" : "PARTIAL",
            ];
        });
        const csv = [header, ...body]
            .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "reporte-notas-finales.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        loadFinalGrades();
    }, []);

    return {
        activeGroups,
        activeSemester,
        downloadReport,
        error,
        finalizeOfficialGrades,
        groupEvaluations,
        loading,
        rows,
        saving,
        selectedGroup,
        selectedGroupSemesterIsActive,
        selectedGroupId,
        setSelectedGroupId,
        summary,
    };
};
