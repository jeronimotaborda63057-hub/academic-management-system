import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/PageHeader";

import type { Student } from "../../models/Student";
import type { Group } from "../../models/Group";
import type { Enrollment } from "../../models/Enrollment";

import { enrollmentService } from "../../services/enrollmentService";
import { studentService } from "../../services/studentService";
import { groupService } from "../../services/groupService";
import type { EnrollmentFormData } from "../../components/EnrollmentModal";
import EnrollmentForm from "../../components/forms/EnrollmentForm";

function buildEnrollmentDate(periodo: string): string {
    const [year, sem] = periodo.split("-");
    const month = sem === "S1" ? "01" : "07";
    return `${year}-${month}-01T00:00:00.000Z`;
}

const EnrollmentCreatePage: React.FC = () => {
    const navigate = useNavigate();

    const [students, setStudents]       = useState<Student[]>([]);
    const [groups, setGroups]           = useState<Group[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading]         = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError]       = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [studentData, groupData, enrollData] = await Promise.all([
            studentService.getAll(),
            groupService.getAll(),
            enrollmentService.getAll(),
        ]);
        setStudents(studentData);
        setGroups(groupData);
        setEnrollments(enrollData);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    async function handleSubmit(data: EnrollmentFormData) {
        setIsSubmitting(true);
        setApiError(null);
        try {
            const created = await enrollmentService.create({
                student_id:      data.student_id,
                group_id:        data.group_id,
                status:          data.status,
                enrollment_date: buildEnrollmentDate(data.periodo_ingreso),
            } as any);

            if (!created) throw new Error("No se pudo crear la matrícula.");
            navigate("/enrollments/list");
        } catch (err: any) {
            setApiError(err?.message ?? "Ocurrió un error inesperado.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Cargando datos…
            </div>
        );
    }

    return (
        <div className="p-6">
            <PageHeader
                title="Nueva matrícula"
                subtitle="Vincula un estudiante a un grupo"
                breadcrumb={["Académico", "Matrículas", "Nueva"]}
            />

            <div className="mt-6 bg-white dark:bg-boxdark rounded-2xl shadow p-6 max-w-lg">
                {apiError && (
                    <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                        </svg>
                        {apiError}
                    </div>
                )}

                <EnrollmentForm
                    students={students}
                    groups={groups}
                    existingEnrollments={enrollments}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate("/enrollments/list")}
                />
            </div>
        </div>
    );
};

export default EnrollmentCreatePage;