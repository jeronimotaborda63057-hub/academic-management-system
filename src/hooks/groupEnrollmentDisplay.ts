import type { EnrollableStudent } from "../models/interfaces/EnrollableStudent";

export const getStudentName = (student?: EnrollableStudent) => {
    const fullName = [
        student?.student.first_name,
        student?.student.last_name,
    ].filter(Boolean).join(" ");

    return fullName || "Estudiante sin nombre";
};

export const getStudentLabel = (student: EnrollableStudent) => {
    const identification = student.student.identification;
    const name = getStudentName(student);

    return identification ? `${name} - ${identification}` : name;
};
