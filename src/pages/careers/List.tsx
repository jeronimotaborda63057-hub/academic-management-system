/**
 * pages/careers/List.tsx — REFACTORIZADO
 *
 * OCP: columnas y filtros son declarativos fuera del componente.
 * DIP: depende de careerService (abstracción), no de axios.
 * Reutiliza: useEntityList, StatusBadge, useConfirmDialog.
 */

import React from "react";
import { Pencil, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Career } from "../../models/uml/Career";
import type { FilterConfig } from "../../models/interfaces/FilterConfig";
import type { Action } from "../../models/interfaces/Action";
import type { Column } from "../../models/interfaces/Column";

import { careerService } from "../../services/careerService";
import { useEntityList } from "../../hooks/useEntityList";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";

import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/ui/GenericTable";
import { StatusBadge } from "../../components/ui/StatusBadge";

// ── Columnas declarativas (OCP) ───────────────────────────────────────────────
const COLUMNS: Column<Career>[] = [
  { key: "code", label: "Código" },
  { key: "name", label: "Nombre" },
  { key: "description", label: "Descripción" },
  {
    key: "is_active",
    label: "Estado",
    render: (value) => (
      <StatusBadge active={Boolean(value)} trueLabel="Activa" falseLabel="Inactiva" />
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

const ACTIONS: Action[] = [
  { name: "edit",    label: "Editar carrera",   icon: <Pencil  size={16} />, primary: true },
  { name: "archive", label: "Archivar carrera",  icon: <Archive size={16} />, variant: "danger" },
];

const FILTERS: FilterConfig[] = [
  {
    key: "is_active",
    label: "Estado",
    options: [
      { label: "Activa",    value: "true"  },
      { label: "Inactiva",  value: "false" },
    ],
  },
];

// ── Filtro de entidad ─────────────────────────────────────────────────────────
const filterCareer = (
  c: Career,
  search: string,
  filterValues: Record<string, string>
) => {
  const matchSearch =
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase());
  const matchActive =
    !filterValues.is_active || String(c.is_active) === filterValues.is_active;
  return matchSearch && matchActive;
};

// ── Componente ────────────────────────────────────────────────────────────────
const CareerList: React.FC = () => {
  const navigate = useNavigate();
  const { confirm, alert } = useConfirmDialog();

  const { filteredData, filterValues, setSearch, handleFilterChange, handleClear, refresh } =
    useEntityList<Career>({
      fetchFn: careerService.getAll.bind(careerService),
      filterFn: filterCareer,
    });

  const archiveCareer = async (id: string) => {
    const ok = await confirm({
      title: "¿Archivar carrera?",
      text: "La carrera dejará de estar disponible para nuevas inscripciones.",
      variant: "danger",
      confirmLabel: "Archivar",
    });
    if (!ok) return;

    const archived = await careerService.archive(id);
    if (archived) {
      alert("Inactiva", "La carrera fue desactivada.", "success");
      refresh();
    } else {
      alert(
        "No se puede archivar",
        "La carrera tiene estudiantes matriculados activos.",
        "error"
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
          data={filteredData}
          columns={COLUMNS}
          actions={ACTIONS}
          onAction={handleAction}
        />
      </div>
    </div>
  );
};

export default CareerList;