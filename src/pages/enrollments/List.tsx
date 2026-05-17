import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/ui/GenericTable";

import type { Enrollment } from "../../models/Enrollment";
import type { Student } from "../../models/Student";
import type { Group } from "../../models/Group";
import type { Column } from "../../models/Column";
import type { Action } from "../../models/Action";

import { enrollmentService } from "../../services/enrollmentService";
import { studentService } from "../../services/studentService";
import { groupService } from "../../services/groupService";

// ─── Helpers ───────────────────────────────────────────────────────────────

function fullName(s?: Student) {
    if (!s) return "—";

    return `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();
}

const STATUS_LABELS: Record<
    string,
    { label: string; cls: string }
> = {
    ACTIVE: {
        label: "Activo",
        cls: "bg-green-100 text-green-700",
    },

    INACTIVE: {
        label: "Inactivo",
        cls: "bg-gray-100 text-gray-600",
    },
};

function StatusBadge({ status }: { status?: string }) {
    const meta = STATUS_LABELS[status ?? ""] ?? {
        label: status ?? "—",
        cls: "bg-gray-100 text-gray-500",
    };

    return (
        <span
            className={`
                inline-flex items-center
                px-2.5 py-0.5
                rounded-full
                text-xs font-medium
                ${meta.cls}
            `}
        >
            {meta.label}
        </span>
    );
}

type EnrichedEnrollment = Enrollment & {
    group?: Group;
    student?: Student;
};

// ─── Página ────────────────────────────────────────────────────────────────

const MatriculasPage: React.FC = () => {
    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState<EnrichedEnrollment[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterGroupId, setFilterGroupId] = useState("");

    // ── Carga datos ───────────────────────────────────────────────────────

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);

            const [enrollData, studentData, groupData] =
                await Promise.all([
                    enrollmentService.getAll(),
                    studentService.getAll(),
                    groupService.getAll(),
                ]);

            // ── Mapas ───────────────────────────────────────────────

            const studentMap = Object.fromEntries(
                studentData.map((s) => [s.id!, s])
            );

            const groupMap = Object.fromEntries(
                groupData.map((g) => [g.id!, g])
            );

            // ── Enriquecer matrículas ──────────────────────────────

            const enriched: EnrichedEnrollment[] = enrollData.map((e) => ({
                ...e,

                student:
                    studentMap[e.student_id ?? ""],

                // IMPORTANTE:
                // group_id → Group
                group:
                    groupMap[e.group_id ?? ""],
            }));

            setEnrollments(enriched);
            setGroups(groupData);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // ── Filtros ───────────────────────────────────────────────────────────

    const filtered = enrollments.filter((e) => {
        const name = fullName(e.student).toLowerCase();

        const identification =
            (e.student?.identification ?? "").toLowerCase();

        const query = search.toLowerCase();

        const matchSearch =
            !query ||
            name.includes(query) ||
            identification.includes(query);

        const matchStatus =
            !filterStatus ||
            e.status === filterStatus;

        const matchGroup =
            !filterGroupId ||
            e.group?.id === filterGroupId;

        return (
            matchSearch &&
            matchStatus &&
            matchGroup
        );
    });

    // ── Columnas ──────────────────────────────────────────────────────────

    const columns: Column<EnrichedEnrollment>[] = [
        {
            label: "Estudiante",
            key: "student_id",

            render: (_value, row) => (
                <div>
                    <p className="font-medium text-black dark:text-white text-sm">
                        {fullName(row.student)}
                    </p>

                    <p className="text-xs text-gray-400">
                        {row.student?.identification ?? "—"}
                    </p>
                </div>
            ),
        },

        {
            label: "Grupo",
            key: "group_id",

            render: (_value, row) => (
                <div>
                    <p className="text-sm font-medium">
                        {row.group?.name ?? "—"}
                    </p>

                    <p className="text-xs text-gray-400">
                        {row.group?.group_code ?? ""}
                    </p>
                </div>
            ),
        },

        {
            label: "Periodo",
            key: "enrollment_date",

            render: (val: string) => {
                if (!val) return "—";

                const d = new Date(val);

                const sem =
                    d.getMonth() < 6
                        ? "S1"
                        : "S2";

                return (
                    <span className="text-sm">
                        {d.getFullYear()}-{sem}
                    </span>
                );
            },
        },

        {
            label: "Estado",
            key: "status",

            render: (val: string) => (
                <StatusBadge status={val} />
            ),
        },

        {
            label: "Fecha matrícula",
            key: "enrollment_date",

            render: (val: string) =>
                val
                    ? new Date(val).toLocaleDateString("es-CO")
                    : "—",
        },
    ];

    // ── Acciones ─────────────────────────────────────────────────────────

    const actions: Action[] = [
        {
            name: "view",
            label: "Ver detalle",
            icon: <Eye size={15} />,
            primary: true,
        },

        {
            name: "edit",
            label: "Editar matrícula",
            icon: <Pencil size={15} />,
        },
    ];

    function handleAction(
        action: string,
        item: EnrichedEnrollment
    ) {
        if (action === "edit") {
            navigate(`/enrollments/edit/${item.id}`);
        }
    }

    function openAssignGroup() {
        navigate("/enrollments/create");
    }

    function openAssignCareer() {
        navigate("/admin/enrollment")
    }

    function handleClearFilters() {
        setSearch("");
        setFilterStatus("");
        setFilterGroupId("");
    }

    // ─── Render ───────────────────────────────────────────────────────────

    return (
        <div className="p-6 space-y-5">

            <PageHeader
                title="Matrículas"
                subtitle={`${filtered.length} registro${filtered.length !== 1
                        ? "s"
                        : ""
                    }`}
                breadcrumb={[
                    "Académico",
                    "Matrículas",
                ]}
                action={[
                    <div className="flex items-center gap-3">
                        <button
                            onClick={openAssignGroup}
                            className="
                h-10 px-5 rounded-xl
                bg-green-600 text-white
                text-sm font-medium
                hover:bg-green-700
                transition
                flex items-center gap-2
            "
                        >
                            <span className="text-lg leading-none">
                                +
                            </span>

                            Inscribir estudiante en grupo
                        </button>

                        <button
                            onClick={openAssignCareer}
                            className="
                h-10 px-5 rounded-xl
                bg-green-600 text-white
                text-sm font-medium
                hover:bg-green-700
                transition
                flex items-center gap-2
            "
                        >
                            <span className="text-lg leading-none">
                                +
                            </span>

                            Matricular estudiante en carrera
                        </button>
                    </div>
                ]}
            />

            <TableToolbar
                searchPlaceholder="Buscar por nombre o cédula…"
                filters={[
                    {
                        key: "status",
                        label: "Estado",

                        options: [
                            {
                                value: "ACTIVE",
                                label: "Activo",
                            },

                            {
                                value: "INACTIVE",
                                label: "Inactivo",
                            },
                        ],
                    },

                    {
                        key: "group_id",
                        label: "Grupo",

                        options: groups.map((g) => ({
                            value: g.id!,
                            label: g.name ?? "Sin nombre",
                        })),
                    },
                ]}
                filterValues={{
                    status: filterStatus,
                    group_id: filterGroupId,
                }}
                onSearchChange={setSearch}
                onFilterChange={(key, val) => {

                    if (key === "status") {
                        setFilterStatus(val);
                    }

                    if (key === "group_id") {
                        setFilterGroupId(val);
                    }
                }}
                onClear={handleClearFilters}
            />

            {loading ? (

                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                    Cargando matrículas…
                </div>

            ) : filtered.length === 0 ? (

                <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">

                    <p className="text-sm">
                        No se encontraron matrículas.
                    </p>

                    <button
                        onClick={openAssignGroup}
                        className="text-sm text-green-600 hover:underline"
                    >
                        Matricular un estudiante
                    </button>

                </div>

            ) : (

                <GenericTable<EnrichedEnrollment>
                    data={filtered}
                    columns={columns}
                    actions={actions}
                    onAction={handleAction}
                />

            )}

        </div>
    );
};

export default MatriculasPage;
