/**
 * Careers/List.tsx — HU-02 (Gestionar carreras)
 *
 * SOLID aplicado:
 * - SRP  : este componente solo orquesta la vista de lista; la lógica de
 *          negocio vive en careerService.
 * - OCP  : los filtros y columnas son configuraciones declarativas (arrays),
 *          no condicionales en el JSX. Agregar una columna no cambia la lógica.
 * - DIP  : dependemos de careerService (abstracción BaseService), no de axios
 *          directamente.
 *
 * Criterios HU-02 cubiertos:
 *   ✅ 1 — Crear, editar y archivar carreras
 *   ✅ 3 — Filtrar por estado (activa/archivada)
 */

import React, { useEffect, useState, useCallback } from "react";
import { Pencil, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import type { Career } from "../../models/Career";
import type { FilterConfig } from "../../models/FilterConfig";
import type { Action } from "../../models/Action";
import type { Column } from "../../models/Column";

import { careerService } from "../../services/careerService";

import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/ui/GenericTable";

// ─── Configuración declarativa de columnas (OCP: cerrado a cambios, abierto a extensión) ─
const COLUMNS: Column<Career>[] = [
    { key: "code",        label: "Código" },
    { key: "name",        label: "Nombre" },
    { key: "description", label: "Descripción" },
    {
        key: "is_active",
        label: "Estado",
        render: (value) => (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
                {value ? "Activa" : "Archivada"}
            </span>
        ),
    },
    {
        key: "created_at",
        label: "Creada",
        render: (value) => (
            <span>{new Date(String(value)).toLocaleDateString("es-CO")}</span>
        ),
    },
];

// Acciones: editar es primaria (botón directo); archivar va en el dropdown
const ACTIONS: Action[] = [
    {
        name: "edit",
        label: "Editar carrera",
        icon: <Pencil size={16} className="text-gray-700" />,
        primary: true,
    },
    {
        name: "archive",
        label: "Archivar carrera",
        icon: <Archive size={16} className="text-red-600" />,
        variant: "danger",
    },
];

// Filtros declarativos (OCP)
const FILTERS: FilterConfig[] = [
    {
        key: "is_active",
        label: "Estado",
        options: [
            { label: "Activa",    value: "true"  },
            { label: "Archivada", value: "false" },
        ],
    },
];

// ─── Componente ───────────────────────────────────────────────────────────────

const CareerList: React.FC = () => {
    const navigate = useNavigate();
    const [data,         setData]         = useState<Career[]>([]);
    const [search,       setSearch]       = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});

    // DIP: usamos el servicio; no sabemos nada de HTTP aquí
    const fetchData = useCallback(async () => {
        const careers = await careerService.getAll();
        setData(careers);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Filtrado local (el backend de este proyecto no tiene endpoint de búsqueda de carreras) ──
    const tableData = data
        .filter((c) => {
            const matchSearch =
                !search ||
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.code.toLowerCase().includes(search.toLowerCase());

            const matchActive =
                filterValues.is_active === undefined ||
                filterValues.is_active === "" ||
                String(c.is_active) === filterValues.is_active;

            return matchSearch && matchActive;
        });

    const handleFilterChange = (key: string, value: string) =>
        setFilterValues((prev) => ({ ...prev, [key]: value }));

    const handleClear = () => {
        setSearch("");
        setFilterValues({});
    };

    // SRP: la lógica de archivo está en una función dedicada
    const archiveCareer = async (id: string) => {
        const result = await Swal.fire({
            title: "¿Archivar carrera?",
            text: "La carrera dejará de estar disponible para nuevas inscripciones.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Archivar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        // HU-02 criterio 3: el backend valida que no haya estudiantes matriculados.
        // Aquí reflejamos el error con un mensaje claro.
        const archived = await careerService.archive(id);
        if (archived) {
            Swal.fire("Archivada", "La carrera fue archivada.", "success");
            fetchData();
        } else {
            Swal.fire(
                "No se puede archivar",
                "La carrera tiene estudiantes matriculados activos.",
                "error",
            );
        }
    };

    const handleAction = (action: string, item: Career) => {
        if (action === "edit")    navigate(`/careers/edit/${item.id}`);
        if (action === "archive") archiveCareer(item.id);
    };

    return (
        <div>
            <PageHeader
                title="Carreras"
                subtitle="Gestiona el catálogo de carreras disponibles en el sistema."
                breadcrumb={["Inicio", "Académico", "Carreras"]}
            />

            <TableToolbar
                searchPlaceholder="Buscar por nombre o código..."
                filters={FILTERS}
                filterValues={filterValues}
                onSearchChange={setSearch}
                onFilterChange={handleFilterChange}
                onClear={handleClear}
                actionLabel="Nueva carrera"
                onAction={() => navigate("/careers/create")}
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

export default CareerList;
