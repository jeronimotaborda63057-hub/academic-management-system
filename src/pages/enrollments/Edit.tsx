// src/pages/enrollments/Edit.tsx

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Enrollment } from "../../models/Enrollment";
import type { Student }    from "../../models/Student";
import type { Group }      from "../../models/Group";

import { enrollmentService } from "../../services/enrollmentService";
import { studentService }    from "../../services/studentService";
import { groupService }      from "../../services/groupService";

import type { EnrollmentFormData } from "../../components/forms/EnrollmentForm";
import EnrollmentForm              from "../../components/forms/EnrollmentForm";

// Importación corregida: ruta canónica del proyecto
import PageHeader from "../../components/ui/PageHeader";

// ─────────────────────────────────────────────────────────────
//  EnrollmentEditPage
//
//  SRP  → carga datos y coordina submit.
//          Lógica de campos delegada a EnrollmentForm.
//  OCP  → EnrollmentForm no se modifica; la página lo compone.
//  DIP  → depende de servicios (abstracciones), no de axios.
// ─────────────────────────────────────────────────────────────

const EnrollmentEditPage: React.FC = () => {

    const navigate     = useNavigate();
    const { id }       = useParams<{ id: string }>();

    const [enrollment,   setEnrollment]   = useState<Enrollment | null>(null);
    const [students,     setStudents]     = useState<Student[]>([]);
    const [groups,       setGroups]       = useState<Group[]>([]);
    const [enrollments,  setEnrollments]  = useState<Enrollment[]>([]);
    const [loading,      setLoading]      = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError,     setApiError]     = useState<string | null>(null);

    // ── Carga inicial ──────────────────────────────────────

    const fetchData = useCallback(async () => {

        if (!id) return;

        setLoading(true);

        try {

            const [enrollmentData, studentData, groupData, allEnrollments] =
                await Promise.all([
                    enrollmentService.getById(id),
                    studentService.getAll(),
                    groupService.getAll(),
                    enrollmentService.getAll(),
                ]);

            setEnrollment(enrollmentData);
            setStudents(studentData);
            setGroups(groupData);
            setEnrollments(allEnrollments);

        } catch (err) {

            console.error(err);
            setApiError("No se pudieron cargar los datos.");

        } finally {

            setLoading(false);
        }

    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Submit ─────────────────────────────────────────────

    const handleSubmit = async (data: EnrollmentFormData) => {

        if (!id || !enrollment) return;

        setIsSubmitting(true);
        setApiError(null);

        try {

            const updated = await enrollmentService.update(id, {
                // student_id y enrollment_date no se envían en edición
                group_id: data.group_id,
                status:   data.status,
            } as any);

            if (!updated) throw new Error("No se pudo actualizar la matrícula.");

            navigate("/enrollments/list");

        } catch (err: any) {

            setApiError(
                err?.response?.data?.message ??
                err?.message ??
                "Ocurrió un error inesperado."
            );

        } finally {

            setIsSubmitting(false);
        }
    };

    // ── Loading inicial ────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Cargando matrícula…
            </div>
        );
    }

    // ── Not found ──────────────────────────────────────────

    if (!enrollment) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
                <p className="text-sm">No se encontró la matrícula.</p>
                <button
                    onClick={() => navigate("/enrollments/list")}
                    className="text-sm text-green-600 hover:underline"
                >
                    Volver al listado
                </button>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────

    return (
        <div>

            <PageHeader
                title="Editar matrícula"
                subtitle="Actualiza el grupo y el estado de la matrícula."
                breadcrumb={["Académico", "Matrículas", "Editar"]}
            />

            <div
                className="
                    bg-white dark:bg-boxdark
                    rounded-2xl
                    border border-stroke dark:border-strokedark
                    p-6
                    flex flex-col
                    gap-4
                "
            >

                {/* Error de API */}
                {apiError && (
                    <div
                        className="
                            flex items-center gap-2
                            rounded-xl
                            bg-red-50 border border-red-200
                            px-4 py-3
                            text-sm text-red-600
                        "
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4m0 4h.01" />
                        </svg>
                        {apiError}
                    </div>
                )}

                {/*
                 * EnrollmentForm conserva sus propios botones y
                 * lógica interna (dropdowns con búsqueda, validación
                 * de duplicados, derivar periodo desde fecha).
                 * Reemplazarlo por FormField violaría SRP.
                 */}
                <EnrollmentForm
                    enrollment={enrollment}
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

export default EnrollmentEditPage;