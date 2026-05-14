import React, { useEffect, useState } from "react";
import type { Student } from "../models/Student";
import type { Career } from "../models/Career";
import type { Enrollment } from "../models/Enrollment";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface EnrollmentFormData {
    student_id: string;
    group_id: string;
    periodo_ingreso: string;   // formato: "YYYY-S1" | "YYYY-S2"
    status: "ACTIVE" | "INACTIVE" | "WITHDRAWN";
}

interface EnrollmentMatriculaModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Llamado al confirmar; la página padre hace el POST y refresca */
    onConfirm: (data: EnrollmentFormData) => Promise<void>;
    /** Matrícula existente para editar sólo el estado (flujo alternativo 4a) */
    enrollmentToEdit?: Enrollment | null;
    students: Student[];
    careers: Career[];
    /** Matrículas existentes para validar duplicados */
    existingEnrollments: Enrollment[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PERIOD_REGEX = /^\d{4}-(S1|S2)$/;

const STATUS_OPTIONS: { value: EnrollmentFormData["status"]; label: string }[] =
    [
        { value: "ACTIVE", label: "Activo" },
        { value: "INACTIVE", label: "Inactivo" },
        { value: "WITHDRAWN", label: "Retirado" },
    ];

function fullName(s: Student) {
    return `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();
}

// ─── Componente ──────────────────────────────────────────────────────────────

const EnrollmentMatriculaModal: React.FC<EnrollmentMatriculaModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    enrollmentToEdit,
    students,
    careers,
    existingEnrollments,
}) => {
    // ── Estado del formulario ──────────────────────────────────────────────
    const [studentSearch, setStudentSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const [groupId, setGroupId] = useState("");
    const [periodo, setPeriodo] = useState("");
    const [status, setStatus] = useState<EnrollmentFormData["status"]>("ACTIVE");

    // ── Errores de validación ──────────────────────────────────────────────
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const isEditMode = !!enrollmentToEdit;

    // ── Inicializar formulario ─────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;

        if (isEditMode && enrollmentToEdit) {
            // Sólo editar estado
            setStatus((enrollmentToEdit.status as EnrollmentFormData["status"]) ?? "ACTIVE");
            const s = students.find((st) => st.id === enrollmentToEdit.student_id) ?? null;
            setSelectedStudent(s);
            setStudentSearch(s ? fullName(s) : "");
            setGroupId(enrollmentToEdit.career?.id ?? "");
            setPeriodo(
                enrollmentToEdit.enrollment_date
                    ? formatPeriodoFromDate(enrollmentToEdit.enrollment_date)
                    : ""
            );
        } else {
            resetForm();
        }
        setErrors({});
        setApiError(null);
    }, [isOpen, enrollmentToEdit]);

    function resetForm() {
        setStudentSearch("");
        setSelectedStudent(null);
        setShowDropdown(false);
        setGroupId("");
        setPeriodo("");
        setStatus("ACTIVE");
        setErrors({});
        setApiError(null);
    }

    function formatPeriodoFromDate(dateStr: string): string {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const semester = date.getMonth() < 6 ? "S1" : "S2";
        return `${year}-${semester}`;
    }

    // ── Búsqueda de estudiantes ────────────────────────────────────────────
    const filteredStudents = students.filter((s) => {
        const q = studentSearch.toLowerCase();
        return (
            fullName(s).toLowerCase().includes(q) ||
            (s.identification ?? "").toLowerCase().includes(q)
        );
    });

    function handleSelectStudent(s: Student) {
        setSelectedStudent(s);
        setStudentSearch(fullName(s));
        setShowDropdown(false);
        setErrors((e) => ({ ...e, student_id: undefined }));
    }

    function handleStudentSearchChange(val: string) {
        setStudentSearch(val);
        setSelectedStudent(null);
        setShowDropdown(true);
        setErrors((e) => ({ ...e, student_id: undefined }));
    }

    // ── Validación ────────────────────────────────────────────────────────
    function validate(): boolean {
        const newErrors: Record<string, string> = {};

        if (!isEditMode) {
            if (!selectedStudent) newErrors.student_id = "Selecciona un estudiante.";
            if (!groupId) newErrors.group_id = "Selecciona un grupo.";
            if (!periodo) {
                newErrors.periodo = "Ingresa el periodo de ingreso.";
            } else if (!PERIOD_REGEX.test(periodo)) {
                newErrors.periodo = "Formato inválido. Usa YYYY-S1 o YYYY-S2 (ej. 2026-S1).";
            }

            // E1: duplicado activo
            if (selectedStudent && groupId) {
                const duplicate = existingEnrollments.find(
                    (e) =>
                        e.student_id === selectedStudent.id &&
                        e.career?.id === groupId &&
                        e.status === "ACTIVE"
                );
                if (duplicate) {
                    newErrors.group_id =
                        "Este estudiante ya tiene una matrícula activa en este grupo.";
                }
            }
        }

        if (!status) newErrors.status = "Selecciona un estado académico.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // ── Envío ─────────────────────────────────────────────────────────────
    async function handleSubmit() {
        if (!validate()) return;
        setSubmitting(true);
        setApiError(null);

        try {
            await onConfirm({
                student_id: selectedStudent!.id!,
                group_id: groupId,
                periodo_ingreso: periodo,
                status,
            });
            onClose();
        } catch (err: any) {
            setApiError(err?.message ?? "Ocurrió un error inesperado.");
        } finally {
            setSubmitting(false);
        }
    }

    // ─── Render ───────────────────────────────────────────────────────────
    if (!isOpen) return null;

    const activeCareer = careers.filter((c) => c.is_active);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Panel */}
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-boxdark rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stroke dark:border-strokedark">
                    <div>
                        <h2 className="text-lg font-bold text-black dark:text-white">
                            {isEditMode ? "Actualizar estado de matrícula" : "Matricular estudiante"}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEditMode
                                ? "Modifica el estado académico de la matrícula existente."
                                : "Vincula formalmente un estudiante a una carrera."}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-meta-4 text-gray-400 transition"
                        aria-label="Cerrar"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">

                    {/* ── Búsqueda de estudiante ── */}
                    <Field label="Estudiante" error={errors.student_id} required>
                        <div className="relative">
                            <input
                                type="text"
                                value={studentSearch}
                                onChange={(e) => handleStudentSearchChange(e.target.value)}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Buscar por nombre, apellido o cédula…"
                                disabled={isEditMode}
                                className={inputCls(!!errors.student_id, isEditMode)}
                            />
                            {/* Ícono lupa */}
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                </svg>
                            </span>

                            {/* Dropdown */}
                            {showDropdown && !isEditMode && studentSearch.length > 0 && (
                                <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                    {filteredStudents.length === 0 ? (
                                        <li className="px-4 py-3 text-sm text-gray-400">Sin resultados</li>
                                    ) : (
                                        filteredStudents.map((s) => (
                                            <li
                                                key={s.id}
                                                onMouseDown={() => handleSelectStudent(s)}
                                                className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-meta-4 cursor-pointer transition"
                                            >
                                                <span className="font-medium text-black dark:text-white">
                                                    {fullName(s)}
                                                </span>
                                                <span className="text-xs text-gray-400">{s.identification}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </div>
                    </Field>

                    {/* ── Carrera ── */}
                    <Field label="Carrera" error={errors.group_id} required>
                        <select
                            value={groupId}
                            onChange={(e) => {
                                setGroupId(e.target.value);
                                setErrors((er) => ({ ...er, group_id: undefined }));
                            }}
                            disabled={isEditMode}
                            className={inputCls(!!errors.group_id, isEditMode)}
                        >
                            <option value="">Selecciona una carrera…</option>
                            {activeCareer.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.code})
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* ── Periodo de ingreso + Estado académico (2 columnas) ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Periodo de ingreso" error={errors.periodo} required hint="Ej: 2026-S1">
                            <input
                                type="text"
                                value={periodo}
                                onChange={(e) => {
                                    setPeriodo(e.target.value);
                                    setErrors((er) => ({ ...er, periodo: undefined }));
                                }}
                                placeholder="2026-S1"
                                disabled={isEditMode}
                                className={inputCls(!!errors.periodo, isEditMode)}
                            />
                        </Field>

                        <Field label="Estado académico" error={errors.status} required>
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value as EnrollmentFormData["status"]);
                                    setErrors((er) => ({ ...er, status: undefined }));
                                }}
                                className={inputCls(!!errors.status, false)}
                            >
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* ── Error de API ── */}
                    {apiError && (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                            </svg>
                            {apiError}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4/30">
                    <button
                        onClick={onClose}
                        className="h-10 px-5 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="h-10 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                        {submitting && (
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                        )}
                        {isEditMode ? "Actualizar estado" : "Matricular"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Sub-componentes locales ──────────────────────────────────────────────────

interface FieldProps {
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}

function Field({ label, error, required, hint, children }: FieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
                {hint && <span className="font-normal text-gray-400 ml-1">· {hint}</span>}
            </label>
            {children}
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

function inputCls(hasError: boolean, disabled: boolean): string {
    const base =
        "w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors";
    const borderColor = hasError
        ? "border-red-400 focus:border-red-500"
        : "border-stroke dark:border-strokedark focus:border-primary";
    const disabledCls = disabled
        ? "bg-gray-100 dark:bg-meta-4 text-gray-400 cursor-not-allowed"
        : "bg-white dark:bg-boxdark text-black dark:text-white";
    return `${base} ${borderColor} ${disabledCls}`;
}

export default EnrollmentMatriculaModal;
export type { EnrollmentFormData };