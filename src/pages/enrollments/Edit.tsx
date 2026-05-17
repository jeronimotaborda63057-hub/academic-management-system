import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import * as Yup from "yup";

import type { Enrollment } from "../../models/Enrollment";
import type { EnrollmentStatus } from "../../models/Enrollment";
import type { Student } from "../../models/Student";
import type { Group } from "../../models/Group";

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

const schema = Yup.object({
    group_id: Yup.string()
        .required("Selecciona un grupo."),

    status: Yup.string()
        .required(),
});

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Ocurrió un error inesperado.";
}

function derivePeriodo(
    date?: string
): string {

    if (!date) return "";

    const d = new Date(date);

    const sem =
        d.getMonth() < 6
            ? "S1"
            : "S2";

    return `${d.getFullYear()}-${sem}`;
}

const EnrollmentEditPage: React.FC = () => {

    const navigate = useNavigate();

    const { id } =
        useParams<{ id: string }>();

    const [students, setStudents] =
        useState<Student[]>([]);

    const [groups, setGroups] =
        useState<Group[]>([]);

    const [enrollment, setEnrollment] =
        useState<Enrollment | null>(null);

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

        if (!id) return;

        const [
            enrollmentData,
            studentData,
            groupData,
        ] = await Promise.all([
            enrollmentService.getById(id),
            studentService.getAll(),
            groupService.getAll(),
        ]);

        setEnrollment(enrollmentData);

        setStudents(studentData);

        setGroups(groupData);

        setForm({
            student_id:
                enrollmentData?.student_id ?? "",

            group_id:
                enrollmentData?.group_id ?? "",

            periodo_ingreso:
                derivePeriodo(
                    enrollmentData?.enrollment_date
                ),

            status:
                enrollmentData?.status ?? "ACTIVE",
        });

        setLoading(false);

    }, [id]);

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

    const handleSubmit = async () => {

        try {

            await schema.validate(form, {
                abortEarly: false,
            });

            setErrors({});

        } catch (err: unknown) {
            if (!(err instanceof Yup.ValidationError)) {
                setApiError(getErrorMessage(err));
                return;
            }

            const nextErrors: Record<string, string> = {};

            err.inner.forEach((e) => {
                if (e.path) {
                    nextErrors[e.path] = e.message;
                }
            });

            setErrors(nextErrors);

            return;
        }

        try {

            if (!id) return;

            setIsSubmitting(true);

            await enrollmentService.update(id, {
                group_id: form.group_id,
                status: form.status as EnrollmentStatus,
            });

            navigate("/enrollments/list");

        } catch (err: unknown) {

            setApiError(
                getErrorMessage(err)
            );

        } finally {

            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Cargando matrícula...
            </div>
        );
    }

    if (!enrollment) {
        return (
            <div className="text-sm text-gray-400">
                No se encontró la matrícula.
            </div>
        );
    }

    return (
        <div>

            <PageHeader
                title="Editar matrícula"
                subtitle="Actualiza la matrícula."
                breadcrumb={[
                    "Académico",
                    "Matrículas",
                    "Editar",
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
                    isEdit
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

export default EnrollmentEditPage;
