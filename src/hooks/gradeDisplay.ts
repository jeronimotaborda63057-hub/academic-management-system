import type { FinalGradeRow } from "../models/interfaces/FinalGradeRow";

export const getFinalGradeStudentName = (row?: FinalGradeRow) => {
    const fullName = [row?.student?.first_name, row?.student?.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || row?.student?.identification || row?.studentId || "Estudiante sin nombre";
};

export const getFinalGradeStudentIdentification = (row?: FinalGradeRow) =>
    row?.student?.identification ?? row?.studentId ?? "Sin identificacion";

export const formatScore = (score: number) => score.toFixed(2);
