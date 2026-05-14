import React, { useEffect, useRef, useState } from "react";
import type { Enrollment } from "../../models/Enrollment";
import type { Student } from "../../models/Student";
import type { Group } from "../../models/Group";

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface EnrollmentFormData {
    student_id: string;
    group_id: string;
    periodo_ingreso: string; // "YYYY-S1" | "YYYY-S2"
    status: "ACTIVE" | "INACTIVE" | "WITHDRAWN";
}

export interface EnrollmentFormProps {
    /** undefined / null → modo creación; Enrollment → modo edición */
    enrollment?: Enrollment | null;
    students: Student[];
    groups: Group[];
    existingEnrollments: Enrollment[];
    isSubmitting?: boolean;
    onSubmit: (data: EnrollmentFormData) => void;
    onCancel: () => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const PERIOD_REGEX = /^\d{4}-(S1|S2)$/;

const STATUS_OPTIONS: { value: EnrollmentFormData["status"]; label: string }[] =
    [
        { value: "ACTIVE",    label: "Activo" },
        { value: "INACTIVE",  label: "Inactivo" },
        { value: "WITHDRAWN", label: "Retirado" },
    ];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function studentFullName(s: Student) {
    return `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();
}

function groupLabel(g: Group) {
    return `${g.name} (${g.group_code})`;
}

function derivePeriodo(dateStr?: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const sem = d.getMonth() < 6 ? "S1" : "S2";
    return `${d.getFullYear()}-${sem}`;
}

// ─── Componente ──────────────────────────────────────────────────────────────

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
    enrollment,
    students,
    groups,
    existingEnrollments,
    isSubmitting = false,
    onSubmit,
    onCancel,
}) => {
    const isEdit = !!enrollment;

    // ── Campos ────────────────────────────────────────────────────────────
    const [studentSearch, setStudentSearch]     = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showStudentDd, setShowStudentDd]     = useState(false);

    const [groupSearch, setGroupSearch]     = useState("");
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [showGroupDd, setShowGroupDd]     = useState(false);

    const [periodo, setPeriodo] = useState("");
    const [status, setStatus]   = useState<EnrollmentFormData["status"]>("ACTIVE");

    // ── Errores ───────────────────────────────────────────────────────────
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    // ── Refs para cerrar dropdowns al hacer click fuera ───────────────────
    const studentDdRef = useRef<HTMLDivElement>(null);
    const groupDdRef   = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (studentDdRef.current && !studentDdRef.current.contains(e.target as Node))
                setShowStudentDd(false);
            if (groupDdRef.current && !groupDdRef.current.contains(e.target as Node))
                setShowGroupDd(false);
        }
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    // ── Inicializar campos cuando llega enrollment (modo edición) ─────────
    useEffect(() => {
        if (isEdit && enrollment) {
            const s = students.find((st) => st.id === enrollment.student_id) ?? null;
            setSelectedStudent(s);
            setStudentSearch(s ? studentFullName(s) : "");

            const g = groups.find((gr) => gr.id === enrollment.group_id) ?? null;
            setSelectedGroup(g);
            setGroupSearch(g ? groupLabel(g) : "");

            setPeriodo(derivePeriodo(enrollment.enrollment_date));
            setStatus((enrollment.status as EnrollmentFormData["status"]) ?? "ACTIVE");
        }
    }, [enrollment, isEdit, students, groups]);

    // ── Filtros de búsqueda ───────────────────────────────────────────────
    const filteredStudents = students.filter((s) => {
        const q = studentSearch.toLowerCase();
        return (
            studentFullName(s).toLowerCase().includes(q) ||
            (s.identification ?? "").toLowerCase().includes(q)
        );
    });

    const filteredGroups = groups.filter((g) => {
        const q = groupSearch.toLowerCase();
        if (!g.name && !g.group_code) return false;
        return (
            (g.name?.toLowerCase().includes(q) ?? false) ||
            (g.group_code?.toLowerCase().includes(q) ?? false)
        );
    });

    // ── Helpers de estado ─────────────────────────────────────────────────
    function clearError(key: string) {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }

    function selectStudent(s: Student) {
        setSelectedStudent(s);
        setStudentSearch(studentFullName(s));
        setShowStudentDd(false);
        clearError("student_id");
    }

    function selectGroup(g: Group) {
        setSelectedGroup(g);
        setGroupSearch(groupLabel(g));
        setShowGroupDd(false);
        clearError("group_id");
    }

    // ── Validación ────────────────────────────────────────────────────────
    function validate(): boolean {
        const next: Record<string, string> = {};

        if (!selectedStudent)
            next.student_id = "Selecciona un estudiante.";

        if (!selectedGroup)
            next.group_id = "Selecciona un grupo.";

        if (!periodo) {
            next.periodo = "Ingresa el periodo de ingreso.";
        } else if (!PERIOD_REGEX.test(periodo)) {
            next.periodo = "Formato inválido. Usa YYYY-S1 o YYYY-S2 (ej. 2026-S1).";
        }

        // E1 — duplicado activo; en edición se excluye la matrícula actual
        if (selectedStudent && selectedGroup) {
            const dup = existingEnrollments.find(
                (e) =>
                    e.student_id === selectedStudent.id &&
                    e.group_id   === selectedGroup.id   &&
                    e.status     === "ACTIVE"            &&
                    e.id         !== enrollment?.id
            );
            if (dup)
                next.group_id =
                    "Este estudiante ya tiene una matrícula activa en este grupo.";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    // ── Envío ─────────────────────────────────────────────────────────────
    function handleSubmit() {
        if (!validate()) return;
        onSubmit({
            student_id:      selectedStudent!.id!,
            group_id:        selectedGroup!.id!,
            periodo_ingreso: periodo,
            status,
        });
    }

    // ─── Render ───────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* ── Estudiante ── */}
            <Field label="Estudiante" error={errors.student_id} required>
                <div className="relative" ref={studentDdRef}>
                    <input
                        type="text"
                        value={studentSearch}
                        placeholder="Buscar por nombre, apellido o cédula…"
                        onChange={(e) => {
                            setStudentSearch(e.target.value);
                            setSelectedStudent(null);
                            setShowStudentDd(true);
                            clearError("student_id");
                        }}
                        onFocus={() => setShowStudentDd(true)}
                        className={inputCls(!!errors.student_id)}
                    />
                    <SearchIcon />

                    {showStudentDd && studentSearch.length > 0 && (
                        <Dropdown>
                            {filteredStudents.length === 0 ? (
                                <EmptyRow />
                            ) : (
                                filteredStudents.map((s) => (
                                    <DropdownItem
                                        key={s.id}
                                        primary={studentFullName(s)}
                                        secondary={s.identification}
                                        onSelect={() => selectStudent(s)}
                                    />
                                ))
                            )}
                        </Dropdown>
                    )}
                </div>
            </Field>

            {/* ── Grupo ── */}
            <Field label="Grupo" error={errors.group_id} required>
                <div className="relative" ref={groupDdRef}>
                    <input
                        type="text"
                        value={groupSearch}
                        placeholder="Buscar por nombre o código de grupo…"
                        onChange={(e) => {
                            setGroupSearch(e.target.value);
                            setSelectedGroup(null);
                            setShowGroupDd(true);
                            clearError("group_id");
                        }}
                        onFocus={() => setShowGroupDd(true)}
                        className={inputCls(!!errors.group_id)}
                    />
                    <SearchIcon />

                    {showGroupDd && groupSearch.length > 0 && (
                        <Dropdown>
                            {filteredGroups.length === 0 ? (
                                <EmptyRow />
                            ) : (
                                filteredGroups.map((g) => (
                                    <DropdownItem
                                        key={g.id}
                                        primary={g.name ?? ""}
                                        secondary={g.group_code}
                                        onSelect={() => selectGroup(g)}
                                    />
                                ))
                            )}
                        </Dropdown>
                    )}
                </div>
            </Field>

            {/* ── Periodo + Estado ── */}
            <div className="grid grid-cols-2 gap-4">
                <Field
                    label="Periodo de ingreso"
                    error={errors.periodo}
                    hint="Ej: 2026-S1"
                    required
                >
                    <input
                        type="text"
                        value={periodo}
                        placeholder="2026-S1"
                        onChange={(e) => {
                            setPeriodo(e.target.value);
                            clearError("periodo");
                        }}
                        className={inputCls(!!errors.periodo)}
                    />
                </Field>

                <Field label="Estado académico" required>
                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value as EnrollmentFormData["status"])
                        }
                        className={inputCls(false)}
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            {/* ── Acciones ── */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-10 px-5 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-10 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                    {isSubmitting && <SpinnerIcon />}
                    {isEdit ? "Guardar cambios" : "Matricular"}
                </button>
            </div>
        </div>
    );
};

// ─── Sub-componentes de UI ────────────────────────────────────────────────────

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
                {hint && (
                    <span className="font-normal text-gray-400 ml-1">· {hint}</span>
                )}
            </label>
            {children}
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                    <AlertIcon size={12} />
                    {error}
                </p>
            )}
        </div>
    );
}

function Dropdown({ children }: { children: React.ReactNode }) {
    return (
        <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {children}
        </ul>
    );
}

function DropdownItem({
    primary,
    secondary,
    onSelect,
}: {
    primary: string;
    secondary?: string;
    onSelect: () => void;
}) {
    return (
        <li
            onMouseDown={onSelect}
            className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-meta-4 cursor-pointer transition"
        >
            <span className="font-medium text-black dark:text-white">{primary}</span>
            {secondary && (
                <span className="text-xs text-gray-400">{secondary}</span>
            )}
        </li>
    );
}

function EmptyRow() {
    return <li className="px-4 py-3 text-sm text-gray-400">Sin resultados</li>;
}

function inputCls(hasError: boolean): string {
    const base = "w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors bg-white dark:bg-boxdark text-black dark:text-white";
    const border = hasError
        ? "border-red-400 focus:border-red-500"
        : "border-stroke dark:border-strokedark focus:border-primary";
    return `${base} ${border}`;
}

function SearchIcon() {
    return (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>
        </span>
    );
}

function AlertIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
        </svg>
    );
}

function SpinnerIcon() {
    return (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

export default EnrollmentForm;