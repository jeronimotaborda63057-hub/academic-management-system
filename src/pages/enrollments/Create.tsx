import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import * as Yup from "yup";

import type { Student } from "../../models/Student";
import type { Group } from "../../models/Group";
import type { Enrollment } from "../../models/Enrollment";

import {
    enrollmentService,
} from "../../services/enrollmentService";

import {
    studentService,
} from "../../services/studentService";

import {
    groupService,
} from "../../services/groupService";

import PageHeader from "../../components/ui/PageHeader";

import EnrollmentForm, {
    type EnrollmentFormValues,
} from "../../components/forms/EnrollmentForm";

const PERIOD_REGEX = /^\d{4}-(S1|S2)$/;

const schema = Yup.object({
    student_id: Yup.string()
        .required("Selecciona un estudiante."),

    group_id: Yup.string()
        .required("Selecciona un grupo."),

    periodo_ingreso: Yup.string()
        .matches(
            PERIOD_REGEX,
            "Formato inválido. Usa YYYY-S1 o YYYY-S2."
        )
        .required("Ingresa el periodo."),

    status: Yup.string()
        .required(),
});

function buildEnrollmentDate(
    periodo: string
): string {
    const [year, sem] = periodo.split("-");

    const month =
        sem === "S1"
            ? "01"
            : "07";

    return `${year}-${month}-01T00:00:00.000Z`;
}

const EnrollmentCreatePage: React.FC = () => {

    const navigate = useNavigate();

    const [students, setStudents] =
        useState<Student[]>([]);

    const [groups, setGroups] =
        useState<Group[]>([]);

    const [enrollments, setEnrollments] =
        useState<Enrollment[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [apiError, setApiError] =
        useState<string | null>(null);

    const [errors, setErrors] =
        useState<Record<string, string>>({});

    const [form, setForm] =
        useState<EnrollmentFormValues>({
            student_id: "",
            group_id: "",
            periodo_ingreso: "",
            status: "ACTIVE",
        });

    const fetchData = useCallback(async () => {

        const [
            studentData,
            groupData,
            enrollmentData,
        ] = await Promise.all([
            studentService.getAll(),
            groupService.getAll(),
            enrollmentService.getAll(),
        ]);

        setStudents(studentData);
        setGroups(groupData);
        setEnrollments(enrollmentData);

        setLoading(false);

    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (
        field: keyof EnrollmentFormValues,
        value: string
    ) => {

        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: "",
        }));
    };

    const validateDuplicate = () => {

        const exists = enrollments.find(
            (enrollment) =>
                enrollment.student_id === form.student_id &&
                enrollment.group_id === form.group_id &&
                enrollment.status === "ACTIVE"
        );

        if (!exists) return true;

        setErrors((prev) => ({
            ...prev,
            group_id:
                "El estudiante ya tiene una matrícula activa en este grupo.",
        }));

        return false;
    };

    const handleSubmit = async () => {

        try {

            await schema.validate(form, {
                abortEarly: false,
            });

            setErrors({});

        } catch (err: any) {

            const nextErrors: Record<string, string> = {};

            err.inner.forEach((e: any) => {
                nextErrors[e.path] = e.message;
            });

            setErrors(nextErrors);

            return;
        }

        if (!validateDuplicate()) {
            return;
        }

        try {

            setIsSubmitting(true);

            await enrollmentService.create({
                student_id: form.student_id,
                group_id: form.group_id,
                status: form.status,
                enrollment_date:
                    buildEnrollmentDate(
                        form.periodo_ingreso
                    ),
            } as any);

            navigate("/enrollments/list");

        } catch (err: any) {

            setApiError(
                err?.message ??
                "Ocurrió un error inesperado."
            );

        } finally {

            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Cargando datos...
            </div>
        );
    }

    return (
        <div>

            <PageHeader
                title="Nueva matrícula"
                subtitle="Vincula un estudiante a un grupo."
                breadcrumb={[
                    "Académico",
                    "Matrículas",
                    "Nueva",
                ]}
            />

            <div
                className="
                    bg-white dark:bg-boxdark
                    rounded-2xl
                    border border-stroke dark:border-strokedark
                    p-6
                "
            >

                {apiError && (
                    <div className="mb-5 text-sm text-red-500">
                        {apiError}
                    </div>
                )}

                <EnrollmentForm
                    values={form}
                    students={students}
                    groups={groups}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() =>
                        navigate("/enrollments/list")
                    }
                />

            </div>

        </div>
    );
};

export default EnrollmentCreatePage;