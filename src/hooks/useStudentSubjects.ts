import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import type { Registration } from "../models/Registration";
import type { Subject } from "../models/Subject";
import type { RootState } from "../store/store";
import { registrationService } from "../services/registrationService";

export interface StudentSubjectRow {
    id: string;
    code: string;
    credits: number;
    groupName: string;
    name: string;
    semesterName: string;
    status: string;
}

const belongsToStudent = (registration: Registration, studentId?: string): boolean => {
    if (!studentId) return false;
    return registration.student_id === studentId || registration.student?.id === studentId;
};

const toSubjectRow = (registration: Registration): StudentSubjectRow | null => {
    const subject: Subject | undefined = registration.group?.subject;
    if (!subject?.id) return null;

    return {
        id: `${registration.id ?? "registration"}-${subject.id}`,
        code: subject.code,
        credits: subject.credits,
        groupName: registration.group?.name ?? registration.group?.group_code ?? "Sin grupo",
        name: subject.name,
        semesterName: registration.group?.semester?.name ?? "Sin semestre",
        status: registration.academic_status ?? (registration.is_active ? "ACTIVE" : "INACTIVE"),
    };
};

export const useStudentSubjects = () => {
    const currentUser = useSelector((state: RootState) => state.user.user);
    const currentStudentId = currentUser?.profile?.id ?? currentUser?.id;

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSubjects = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await registrationService.getAll();
                setRegistrations(data);
            } catch {
                setError("No fue posible cargar tus asignaturas.");
            } finally {
                setLoading(false);
            }
        };

        loadSubjects();
    }, []);

    const subjects = useMemo(() => {
        const rows = registrations
            .filter((registration) => belongsToStudent(registration, currentStudentId))
            .map(toSubjectRow)
            .filter((row): row is StudentSubjectRow => Boolean(row));

        return Array.from(
            new Map(rows.map((row) => [row.id, row])).values()
        );
    }, [currentStudentId, registrations]);

    return {
        error,
        loading,
        subjects,
    };
};
