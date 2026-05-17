import type { StudentEnrollmentOption } from "../../hooks/useStudentEnrollment";
import {
    getStudentDisplayName,
    isRegistrationActive,
} from "../../hooks/useStudentEnrollment";

export const formatActiveCareer = (option: StudentEnrollmentOption): string => {
    const activeRegistrations = option.registrations.filter(isRegistrationActive);
    if (activeRegistrations.length === 0) return "Sin matricula activa";
    if (activeRegistrations.length === 1) {
        return activeRegistrations[0].career?.name ?? "Carrera activa";
    }

    return `${activeRegistrations.length} carreras activas`;
};

export const selectedStudentName = (
    selectedStudent: StudentEnrollmentOption | null
): string => (selectedStudent ? getStudentDisplayName(selectedStudent.user) : "");

export const formatDateTime = (value?: string): string => {
    if (!value) return "-";

    return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
};
