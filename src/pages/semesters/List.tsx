/**
 * pages/semesters/List.tsx — REFACTORIZADO
 *
 * Reutiliza: useEntityList, StatusBadge, useConfirmDialog.
 */

import React from "react";
import { Pencil, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Semester } from "../../models/uml/Semester";
import type { Column } from "../../models/interfaces/Column";
import type { Action } from "../../models/interfaces/Action";

import { semesterService } from "../../services/semesterService";
import { useEntityList } from "../../hooks/useEntityList";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";

import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/ui/GenericTable";
import { StatusBadge } from "../../components/ui/StatusBadge";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
};

// ── Columnas ──────────────────────────────────────────────────────────────────
const COLUMNS: Column<Semester>[] = [
  { key: "code", label: "Código" },
  { key: "name", label: "Nombre" },
  { key: "start_date", label: "Inicio", render: (v) => <span>{fmt(String(v))}</span> },
  { key: "end_date",   label: "Fin",    render: (v) => <span>{fmt(String(v))}</span> },
  {
    key: "is_active",
    label: "Estado",
    render: (value) => (
      <StatusBadge active={Boolean(value)} trueLabel="Activo" falseLabel="Cerrado" />
    ),
  },
];

const ACTIONS: Action[] = [
  { name: "edit",     label: "Editar semestre",  icon: <Pencil      size={16} />, primary: true },
  { name: "activate", label: "Activar semestre",  icon: <CheckCircle size={16} className="text-green-600" /> },
  { name: "close",    label: "Cerrar semestre",   icon: <XCircle     size={16} className="text-red-600"   />, variant: "danger" },
];

// ── Filtro ────────────────────────────────────────────────────────────────────
const filterSemester = (
  s: Semester,
  search: string,
  filterValues: Record<string, string>
) => {
  const matchSearch =
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase());
  const matchActive =
    !filterValues.is_active || String(s.is_active) === filterValues.is_active;
  return matchSearch && matchActive;
};

// ── Componente ────────────────────────────────────────────────────────────────
const SemesterList: React.FC = () => {
  const navigate = useNavigate();
  const { confirm, alert } = useConfirmDialog();

  const { filteredData, filterValues, setSearch, handleFilterChange, handleClear, refresh } =
    useEntityList<Semester>({
      fetchFn: semesterService.getAll.bind(semesterService),
      filterFn: filterSemester,
    });

  // Necesitamos actualizar localmente para reflejar el cambio al instante
  // sin esperar un re-fetch completo.
  const activateSemester = async (id: string) => {
    const ok = await confirm({
      title: "¿Activar este semestre?",
      text: "El semestre activo actual será cerrado automáticamente.",
      variant: "question",
      confirmLabel: "Activar",
    });
    if (!ok) return;

    const updated = await semesterService.setActive(id);
    if (updated) {
      alert("Activado", "El semestre fue activado.", "success");
      refresh();
    } else {
      alert("Error", "No se pudo activar el semestre.", "error");
    }
  };

  const closeSemester = async (id: string) => {
    const ok = await confirm({
      title: "¿Cerrar semestre?",
      text: "No se podrán registrar más notas ni inscripciones en este semestre.",
      variant: "danger",
      confirmLabel: "Cerrar",
    });
    if (!ok) return;

    const updated = await semesterService.close(id);
    if (updated) {
      alert("Cerrado", "El semestre fue cerrado.", "success");
      refresh();
    } else {
      alert("Error", "No se pudo cerrar el semestre.", "error");
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
            { label: "Activo",   value: "true"  },
            { label: "Cerrado",  value: "false" },
          ],
        }]}
        filterValues={filterValues}
        onSearchChange={setSearch}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
        actionLabel="Nuevo semestre"
        onAction={() => navigate("/semesters/create")}
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

export default SemesterList;
