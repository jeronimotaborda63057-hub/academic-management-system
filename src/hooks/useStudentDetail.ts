import { useEffect, useState } from "react";

import type { Enrollment } from "../models/uml/Enrollment";
import type { Student } from "../models/uml/Student";
import { enrollmentService } from "../services/enrollmentService";
import { studentService } from "../services/studentService";

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

                // Buscar inscripciones a grupos por student_id del perfil
                const studentEnrollments = await enrollmentService.search({
                    student_id: studentData?.id ?? studentId,
                });
                setEnrollments(studentEnrollments ?? []);
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