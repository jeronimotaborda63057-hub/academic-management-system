import React from "react";

import type { Student } from "../../models/Student";
import type { Group } from "../../models/Group";

export interface EnrollmentFormValues {
    student_id: string;
    group_id: string;
    periodo_ingreso: string;
    status: "ACTIVE" | "INACTIVE" | "WITHDRAWN";
}

interface EnrollmentFormProps {
    values: EnrollmentFormValues;
    students: Student[];
    groups: Group[];

    errors?: Record<string, string>;

    isEdit?: boolean;
    isSubmitting?: boolean;

    onChange: (
        field: keyof EnrollmentFormValues,
        value: string
    ) => void;

    onSubmit: () => void;
    onCancel: () => void;
}

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Activo" },
    { value: "INACTIVE", label: "Inactivo" },
    { value: "WITHDRAWN", label: "Retirado" },
];

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
    values,
    students,
    groups,
    errors = {},
    isEdit = false,
    isSubmitting = false,
    onChange,
    onSubmit,
    onCancel,
}) => {
    return (
        <div className="flex flex-col gap-5">

            {/* Estudiante */}
            <Field
                label="Estudiante"
                error={errors.student_id}
                required
            >
                <select
                    value={values.student_id}
                    disabled={isEdit}
                    onChange={(e) =>
                        onChange("student_id", e.target.value)
                    }
                    className={inputCls(!!errors.student_id)}
                >
                    <option value="">
                        Selecciona un estudiante
                    </option>

                    {students.map((student) => (
                        <option
                            key={student.id}
                            value={student.id}
                        >
                            {student.first_name} {student.last_name}
                        </option>
                    ))}
                </select>
            </Field>

            {/* Grupo */}
            <Field
                label="Grupo"
                error={errors.group_id}
                required
            >
                <select
                    value={values.group_id}
                    onChange={(e) =>
                        onChange("group_id", e.target.value)
                    }
                    className={inputCls(!!errors.group_id)}
                >
                    <option value="">
                        Selecciona un grupo
                    </option>

                    {groups.map((group) => (
                        <option
                            key={group.id}
                            value={group.id}
                        >
                            {group.name} ({group.group_code})
                        </option>
                    ))}
                </select>
            </Field>

            {/* Periodo + Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Field
                    label="Periodo de ingreso"
                    error={errors.periodo_ingreso}
                    required
                >
                    <input
                        type="text"
                        value={values.periodo_ingreso}
                        disabled={isEdit}
                        placeholder="2026-S1"
                        onChange={(e) =>
                            onChange(
                                "periodo_ingreso",
                                e.target.value
                            )
                        }
                        className={inputCls(!!errors.periodo_ingreso)}
                    />
                </Field>

                <Field
                    label="Estado académico"
                    required
                >
                    <select
                        value={values.status}
                        onChange={(e) =>
                            onChange("status", e.target.value)
                        }
                        className={inputCls(false)}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </Field>

            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-strokedark">

                <button
                    type="button"
                    onClick={onCancel}
                    className="
                        h-10 px-5 rounded-xl
                        border border-gray-200
                        dark:border-strokedark
                        text-sm text-gray-700 dark:text-white
                        hover:bg-gray-50 dark:hover:bg-meta-4
                        transition
                    "
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="
                        h-10 px-6 rounded-xl
                        bg-primary text-white
                        text-sm font-medium
                        hover:opacity-90
                        disabled:opacity-60
                        disabled:cursor-not-allowed
                        transition
                    "
                >
                    {isEdit
                        ? "Guardar cambios"
                        : "Matricular"}
                </button>

            </div>

        </div>
    );
};

export default EnrollmentForm;

// ─────────────────────────────────────────────
// UI
// ─────────────────────────────────────────────

interface FieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

const Field = ({
    label,
    error,
    required,
    children,
}: FieldProps) => (
    <div className="flex flex-col gap-1.5">

        <label className="text-xs font-semibold text-gray-500 dark:text-gray-300 flex items-center gap-1">
            {label}

            {required && (
                <span className="text-red-500">*</span>
            )}
        </label>

        {children}

        {error && (
            <p className="text-xs text-red-500">
                {error}
            </p>
        )}

    </div>
);

const inputCls = (hasError: boolean) =>
    `
        w-full h-11 px-4 rounded-xl border
        text-sm outline-none transition-colors
        bg-white dark:bg-boxdark
        text-gray-900 dark:text-white

        ${
            hasError
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 dark:border-strokedark focus:border-primary"
        }
    `;