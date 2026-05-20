import { useEffect, useState } from "react";

import type { Enrollment } from "../models/uml/Enrollment";
import type { Group } from "../models/uml/Group";
import type { Student } from "../models/uml/Student";
import { enrollmentService } from "../services/enrollmentService";
import { groupService } from "../services/groupService";
import { semesterService } from "../services/semesterService";
import { studentService } from "../services/studentService";
import { subjectService } from "../services/subjectService";

export const getStudentFullName = (student?: Student | null): string => {
    const fullName = [student?.first_name, student?.last_name]
        .filter(Boolean)
        .join(" ");
    return fullName || student?.identification || "Estudiante";
};

export const useStudentDetail = (studentId?: string) => {
    const [student, setStudent] = useState<Student | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStudent = async () => {
            if (!studentId) {
                setLoading(false);
                setError("No se recibió el estudiante solicitado.");
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const studentData = await studentService.getById(studentId);
                setStudent(studentData);

                const [studentEnrollments, groups, subjects, semesters] = await Promise.all([
                    enrollmentService.search({
                        student_id: studentData?.id ?? studentId,
                    }),
                    groupService.getAllWithAuth(),
                    subjectService.getAllWithAuth(),
                    semesterService.getAllWithAuth(),
                ]);
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
                    (studentEnrollments ?? []).map((enrollment) => ({
                        ...enrollment,
                        group: enrollment.group ?? groupById.get(enrollment.group_id ?? ""),
                    }))
                );
            } catch {
                setError("No fue posible cargar el detalle del estudiante.");
            } finally {
                setLoading(false);
            }
        };

        loadStudent();
    }, [studentId]);

    return {
        enrollments,
        error,
        loading,
        student,
        studentName: getStudentFullName(student),
    };
};
