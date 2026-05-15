import type { Enrollment } from "../models/Enrollment";
import type { Grade } from "../models/Grade";

export const getStudentDisplayName = (enrollment?: Enrollment) => {
    const student = enrollment?.student;
    const fullName = [student?.first_name, student?.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || student?.identification || "Estudiante sin nombre";
};

export const getStudentOptionLabel = (enrollment: Enrollment) => {
    const name = getStudentDisplayName(enrollment);
    const identification = enrollment.student?.identification;

    return identification ? `${name} - ${identification}` : name;
};

export const getStudentIdentification = (enrollment?: Enrollment) =>
    enrollment?.student?.identification ?? "Sin identificacion";

export const getGradeScore = (grade?: Grade) =>
    grade?.final_score ?? grade?.note_final ?? grade?.nota_final ?? 0;
