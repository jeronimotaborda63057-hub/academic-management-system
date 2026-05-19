import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import type { Enrollment } from "../models/uml/Enrollment";
import type { RootState } from "../store/store";
import { enrollmentService } from "../services/enrollmentService";

export interface StudentSubjectRow {
    id: string;
    code: string;
    credits: number;
    groupName: string;
    name: string;
    semesterName: string;
    status: string;
}

// Enrollment.group puede venir enriquecido con subject y semester desde el backend
type EnrichedGroup = {
    id?: string;
    name?: string;
    group_code?: string;
    subject?: { id?: string; code?: string; name?: string; credits?: number };
    semester?: { name?: string };
};

const toSubjectRow = (enrollment: Enrollment): StudentSubjectRow | null => {
    const group = enrollment.group as EnrichedGroup | undefined;
    const subject = group?.subject;
    if (!subject?.id) return null;

    return {
        id: `${enrollment.id ?? "enrollment"}-${subject.id}`,
        code: subject.code ?? "—",
        credits: subject.credits ?? 0,
        groupName: group?.name ?? group?.group_code ?? enrollment.group_id ?? "Sin grupo",
        name: subject.name ?? "Sin nombre",
        semesterName: group?.semester?.name ?? "Sin semestre",
        status: enrollment.status ?? "ACTIVE",
    };
};

export const useStudentSubjects = () => {
    // ID del perfil del estudiante autenticado
    const currentUser = useSelector((state: RootState) => state.user.user);
    const currentStudentId: string | undefined =
        currentUser?.profile?.id ?? currentUser?.id;

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSubjects = async () => {
            if (!currentStudentId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                // Solo inscripciones del estudiante autenticado, no todo el sistema
                const data = await enrollmentService.search({
                    student_id: currentStudentId,
                });
                setEnrollments(data ?? []);
            } catch {
                setError("No fue posible cargar tus asignaturas.");
            } finally {
                setLoading(false);
            }
        };

        loadSubjects();
    }, [currentStudentId]);

    const subjects = useMemo(() => {
        const rows = enrollments
            .map(toSubjectRow)
            .filter((row): row is StudentSubjectRow => Boolean(row));

        // Eliminar posibles duplicados
        return Array.from(new Map(rows.map((row) => [row.id, row])).values());
    }, [enrollments]);

    return {
        error,
        loading,
        subjects,
    };
};