import React, { useCallback, useEffect, useState } from "react";
import { Eye, Pencil } from "lucide-react";

import PageHeader from "../../components/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/GenericTable";
import EnrollmentMatriculaModal, {  type EnrollmentFormData, } from "../../components/EnrollmentModal";

import type { Enrollment } from "../../models/Enrollment";
import type { Student } from "../../models/Student";
import type { Career } from "../../models/Career";
import type { Column } from "../../models/Column";
import type { Action } from "../../models/Action";

import { enrollmentService } from "../../services/enrollmentService";
import { studentService } from "../../services/studentService";
import { careerService } from "../../services/careerService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fullName(s?: Student) {
    if (!s) return "—";
    return `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
    ACTIVE:    { label: "Activo",    cls: "bg-green-100 text-green-700" },
    INACTIVE:  { label: "Inactivo",  cls: "bg-gray-100 text-gray-600" },
    WITHDRAWN: { label: "Retirado",  cls: "bg-red-100 text-red-600" },
};

function StatusBadge({ status }: { status?: string }) {
    const meta = STATUS_LABELS[status ?? ""] ?? { label: status ?? "—", cls: "bg-gray-100 text-gray-500" };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.cls}`}>
            {meta.label}
        </span>
    );
}

// ─── Página ──────────────────────────────────────────────────────────────────

const MatriculasPage: React.FC = () => {
    // ── Datos ─────────────────────────────────────────────────────────────
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Modal ─────────────────────────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [enrollmentToEdit, setEnrollmentToEdit] = useState<Enrollment | null>(null);

    // ── Filtros ───────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterCareerId, setFilterCareerId] = useState("");

    // ── Carga inicial ─────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        setLoading(true);
        const [enrollData, studentData, careerData] = await Promise.all([
            enrollmentService.getAll(),
            studentService.getAll(),
            careerService.getAll(),
        ]);

        // Enriquecer enrollments con student y career anidados
        const studMap = Object.fromEntries(studentData.map((s) => [s.id!, s]));
        const careerMap = Object.fromEntries(careerData.map((c) => [c.id, c]));

        const enriched: Enrollment[] = enrollData.map((e) => ({
            ...e,
            student: studMap[e.student_id ?? ""],
            career: careerMap[e.group_id ?? ""], // group_id apunta al career según el backend
        }));

        setEnrollments(enriched);
        setStudents(studentData);
        setCareers(careerData);
        setLoading(false);
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Filtrado local ────────────────────────────────────────────────────
    const filtered = enrollments.filter((e) => {
        const name = fullName(e.student).toLowerCase();
        const id = (e.student?.identification ?? "").toLowerCase();
        const q = search.toLowerCase();

        const matchSearch = !q || name.includes(q) || id.includes(q);
        const matchStatus = !filterStatus || e.status === filterStatus;
        const matchCareer = !filterCareerId || e.career?.id === filterCareerId;

        return matchSearch && matchStatus && matchCareer;
    });

    // ── Columnas ──────────────────────────────────────────────────────────
    const columns: Column<Enrollment>[] = [
        {
            label: "Estudiante",
            key: "student_id",
            render: (_: any, row: Enrollment) => (
                <div>
                    <p className="font-medium text-black dark:text-white text-sm">
                        {fullName(row.student)}
                    </p>
                    <p className="text-xs text-gray-400">{row.student?.identification}</p>
                </div>
            ),
        },
        {
            label: "Carrera",
            key: "group_id",
            render: (_: any, row: Enrollment) => (
                <span className="text-sm">{row.career?.name ?? "—"}</span>
            ),
        },
        {
            label: "Periodo",
            key: "enrollment_date",
            render: (val: string) => {
                if (!val) return "—";
                const d = new Date(val);
                const sem = d.getMonth() < 6 ? "S1" : "S2";
                return <span className="text-sm">{d.getFullYear()}-{sem}</span>;
            },
        },
        {
            label: "Estado",
            key: "status",
            render: (val: string) => <StatusBadge status={val} />,
        },
        {
            label: "Fecha matrícula",
            key: "enrollment_date",
            render: (val: string) =>
                val ? new Date(val).toLocaleDateString("es-CO") : "—",
        },
    ];

    // ── Acciones ──────────────────────────────────────────────────────────
    const actions: Action[] = [
        {
            name: "view",
            label: "Ver detalle",
            icon: <Eye size={15} />,
            primary: true,
        },
        {
            name: "edit",
            label: "Actualizar estado",
            icon: <Pencil size={15} />,
        },
    ];

    function handleAction(action: string, item: Enrollment) {
        if (action === "edit") {
            setEnrollmentToEdit(item);
            setModalOpen(true);
        }
        // "view" puede abrir un drawer de detalle — fuera del scope de CU-06
    }

    // ── Crear / Actualizar ────────────────────────────────────────────────
    async function handleConfirm(data: EnrollmentFormData) {
        if (enrollmentToEdit) {
            // Flujo alternativo 4a: actualizar solo el estado
            const updated = await enrollmentService.update(enrollmentToEdit.id!, {
                status: data.status,
            });
            if (!updated) throw new Error("No se pudo actualizar el estado de la matrícula.");
        } else {
            // Flujo principal: crear matrícula
            const created = await enrollmentService.create({
                student_id: data.student_id,
                group_id: data.group_id,
                status: data.status,
                enrollment_date: buildEnrollmentDate(data.periodo_ingreso),
            } as any);
            if (!created) throw new Error("No se pudo crear la matrícula.");
        }
        await fetchAll();
    }

    function buildEnrollmentDate(periodo: string): string {
        const [year, sem] = periodo.split("-");
        const month = sem === "S1" ? "01" : "07";
        return `${year}-${month}-01T00:00:00.000Z`;
    }

    function openCreate() {
        setEnrollmentToEdit(null);
        setModalOpen(true);
    }

    function handleClearFilters() {
        setSearch("");
        setFilterStatus("");
        setFilterCareerId("");
    }

    // ─── Render ───────────────────────────────────────────────────────────
    return (
        <div className="p-6 space-y-5">
            {/* Encabezado */}
            <PageHeader
                title="Matrículas"
                subtitle={`${filtered.length} registro${filtered.length !== 1 ? "s" : ""}`}
                breadcrumb={["Académico", "Matrículas"]}
                action={
                    <button
                        onClick={openCreate}
                        className="h-10 px-5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <span className="text-lg leading-none">+</span>
                        Matricular estudiante
                    </button>
                }
            />

            {/* Toolbar */}
            <TableToolbar
                searchPlaceholder="Buscar por nombre o cédula…"
                filters={[
                    {
                        key: "status",
                        label: "Estado",
                        options: [
                            { value: "ACTIVE",    label: "Activo" },
                            { value: "INACTIVE",  label: "Inactivo" },
                            { value: "WITHDRAWN", label: "Retirado" },
                        ],
                    },
                    {
                        key: "career_id",
                        label: "Carrera",
                        options: careers.map((c) => ({ value: c.id, label: c.name })),
                    },
                ]}
                filterValues={{ status: filterStatus, career_id: filterCareerId }}
                onSearchChange={setSearch}
                onFilterChange={(key, val) => {
                    if (key === "status") setFilterStatus(val);
                    if (key === "career_id") setFilterCareerId(val);
                }}
                onClear={handleClearFilters}
            />

            {/* Tabla */}
            {loading ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                    Cargando matrículas…
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 17H5a2 2 0 0 0-2 2v1h14v-1a2 2 0 0 0-2-2h-4Z" />
                        <path d="M12 3a5 5 0 1 0 0 10A5 5 0 0 0 12 3Z" />
                    </svg>
                    <p className="text-sm">No se encontraron matrículas.</p>
                    <button
                        onClick={openCreate}
                        className="mt-1 text-sm text-green-600 hover:underline"
                    >
                        Matricular un estudiante
                    </button>
                </div>
            ) : (
                <GenericTable<Enrollment>
                    data={filtered}
                    columns={columns}
                    actions={actions}
                    onAction={handleAction}
                />
            )}

            {/* Modal */}
            <EnrollmentMatriculaModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEnrollmentToEdit(null);
                }}
                onConfirm={handleConfirm}
                enrollmentToEdit={enrollmentToEdit}
                students={students}
                careers={careers}
                existingEnrollments={enrollments}
            />
        </div>
    );
};

export default MatriculasPage;