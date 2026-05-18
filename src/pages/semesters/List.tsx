import React, { useEffect, useState, useCallback } from "react";
import { Pencil, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import type { Semester } from "../../models/Semester";
import type { Column } from "../../models/Column";
import type { Action } from "../../models/Action";

import { semesterService } from "../../services/semesterService";

import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/ui/GenericTable";

// ── Helpers de formato ────────────────────────────────────────────────────────
const fmt = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return new Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(Number(year), Number(month) - 1, Number(day)));
};

// ── Columnas declarativas ─────────────────────────────────────────────────────
const COLUMNS: Column<Semester>[] = [
    { key: "code", label: "Código" },
    { key: "name", label: "Nombre" },
    {
        key: "start_date",
        label: "Inicio",
        render: (v) => <span>{fmt(String(v))}</span>,
    },
    {
        key: "end_date",
        label: "Fin",
        render: (v) => <span>{fmt(String(v))}</span>,
    },
    {
        key: "is_active",
        label: "Estado",
        render: (value) => (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
                {value ? "Activo" : "Cerrado"}
            </span>
        ),
    },
];

// ── Acciones ──────────────────────────────────────────────────────────────────
const ACTIONS: Action[] = [
    {
        name:    "edit",
        label:   "Editar semestre",
        icon:    <Pencil size={16} className="text-gray-700" />,
        primary: true,
    },
    {
        name:  "activate",
        label: "Activar semestre",
        icon:  <CheckCircle size={16} className="text-green-600" />,
    },
    {
        name:    "close",
        label:   "Cerrar semestre",
        icon:    <XCircle size={16} className="text-red-600" />,
        variant: "danger",
    },
];

// ── Componente ────────────────────────────────────────────────────────────────
const SemesterList: React.FC = () => {
    const navigate = useNavigate();
    const [data,         setData]         = useState<Semester[]>([]);
    const [search,       setSearch]       = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});

    const fetchData = useCallback(async () => {
        const semesters = await semesterService.getAll();
        setData(semesters);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Filtrado local con búsqueda + filtro de estado
    const tableData = data.filter((s) => {
        const matchSearch =
            !search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.code.toLowerCase().includes(search.toLowerCase());

        const matchActive =
            !filterValues.is_active ||
            String(s.is_active) === filterValues.is_active;

        return matchSearch && matchActive;
    });

    // ── Activar semestre ──────────────────────────────────────────────────────
    const activateSemester = async (id: string) => {
        const result = await Swal.fire({
            title: "¿Activar este semestre?",
            text:  "El semestre activo actual será cerrado automáticamente.",
            icon:  "question",
            showCancelButton:  true,
            confirmButtonText: "Activar",
            cancelButtonText:  "Cancelar",
        });
        if (!result.isConfirmed) return;

        const updated = await semesterService.setActive(id);

        if (updated) {
            // Desactiva todos y marca solo el nuevo como activo
            setData(prev => prev.map(s => ({ ...s, is_active: s.id === id })));
            Swal.fire("Activado", "El semestre fue activado.", "success");
        } else {
            Swal.fire("Error", "No se pudo activar el semestre.", "error");
        }
    };

    // ── Cerrar semestre ───────────────────────────────────────────────────────
    const closeSemester = async (id: string) => {
        const result = await Swal.fire({
            title: "¿Cerrar semestre?",
            text:  "No se podrán registrar más notas ni inscripciones en este semestre.",
            icon:  "warning",
            showCancelButton:  true,
            confirmButtonText: "Cerrar",
            cancelButtonText:  "Cancelar",
            confirmButtonColor: "#d33",
        });
        if (!result.isConfirmed) return;

        const updated = await semesterService.close(id);

        if (updated) {
            setData(prev =>
                prev.map(s => s.id === id ? { ...s, is_active: false } : s)
            );
            Swal.fire("Cerrado", "El semestre fue cerrado.", "success");
        } else {
            Swal.fire("Error", "No se pudo cerrar el semestre.", "error");
        }
    };

    const handleAction = (action: string, item: Semester) => {
        if (action === "edit")     navigate(`/semesters/edit/${item.id}`);
        if (action === "activate") activateSemester(item.id);
        if (action === "close")    closeSemester(item.id);
    };

    return (
        <div>
            <PageHeader
                title="Semestres"
                subtitle="Gestiona los periodos académicos del sistema."
                breadcrumb={["Inicio", "Académico", "Semestres"]}
            />

            <TableToolbar
                searchPlaceholder="Buscar por nombre o código..."
                filters={[{
                    key: "is_active",
                    label: "Estado",
                    options: [
                        { label: "Activo",  value: "true"  },
                        { label: "Cerrado", value: "false" },
                    ],
                }]}
                filterValues={filterValues}
                onSearchChange={setSearch}
                onFilterChange={(k, v) => setFilterValues((p) => ({ ...p, [k]: v }))}
                onClear={() => { setSearch(""); setFilterValues({}); }}
                actionLabel="Nuevo semestre"
                onAction={() => navigate("/semesters/create")}
            />

            <div className="mt-4">
                <GenericTable
                    data={tableData}
                    columns={COLUMNS}
                    actions={ACTIONS}
                    onAction={handleAction}
                />
            </div>
        </div>
    );
};

export default SemesterList;