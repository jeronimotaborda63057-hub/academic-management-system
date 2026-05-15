import type { Grade } from "../models/Grade";
import type { GradingStudent } from "../models/GradingStudent";

export const getStudentDisplayName = (studentItem?: GradingStudent) => {
    const student = studentItem?.student;
    const fullName = [student?.first_name, student?.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || student?.identification || studentItem?.studentId || "Estudiante sin nombre";
};

export const getStudentOptionLabel = (studentItem: GradingStudent) => {
    const name = getStudentDisplayName(studentItem);
    const identification = studentItem.student?.identification;

    return identification ? `${name} - ${identification}` : name;
};

export const getStudentIdentification = (studentItem?: GradingStudent) =>
    studentItem?.student?.identification ?? studentItem?.studentId ?? "Sin identificacion";

export const getGradeScore = (grade?: Grade) =>
    grade?.final_score ?? grade?.note_final ?? grade?.nota_final ?? 0;
