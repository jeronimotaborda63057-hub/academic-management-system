import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import type { Enrollment } from "../models/uml/Enrollment";
import type { Group } from "../models/uml/Group";
import type { RootState } from "../store/store";
import { enrollmentService } from "../services/enrollmentService";
import { groupService } from "../services/groupService";
import { semesterService } from "../services/semesterService";
import { studentService } from "../services/studentService";
import { subjectService } from "../services/subjectService";

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

const isActiveEnrollment = (enrollment: Enrollment) =>
    enrollment.status === "ACTIVE" || (!enrollment.status && Boolean(enrollment.group_id));

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
            if (!currentUser?.id && !currentStudentId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const [studentProfiles, groups, subjects, semesters] = await Promise.all([
                    studentService.getAllWithAuth(),
                    groupService.getAllWithAuth(),
                    subjectService.getAllWithAuth(),
                    semesterService.getAllWithAuth(),
                ]);
                const profileId =
                    currentStudentId ??
                    studentProfiles.find((student) => student.user_id === currentUser?.id)?.id;

                if (!profileId) {
                    setEnrollments([]);
                    return;
                }

                const data = await enrollmentService.search({ student_id: profileId });
                const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
                const semesterById = new Map(semesters.map((semester) => [semester.id, semester]));
                const groupById = new Map(
                    groups.map((group): [string | undefined, Group] => [
                        group.id,
                        {
                            ...group,
                            subject: group.subject ?? subjectById.get(group.subject_id ?? ""),
                            semester: group.semester ?? semesterById.get(group.semester_id ?? ""),
                        },
                    ])
                );

                setEnrollments(
                    (data ?? [])
                        .filter(isActiveEnrollment)
                        .map((enrollment) => ({
                            ...enrollment,
                            group: enrollment.group ?? groupById.get(enrollment.group_id ?? ""),
                        }))
                );
            } catch {
                setError("No fue posible cargar tus asignaturas.");
            } finally {
                setLoading(false);
            }
        };

        loadSubjects();
    }, [currentStudentId, currentUser?.id]);

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
