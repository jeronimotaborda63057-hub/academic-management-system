/**
 * pages/subjects/List.tsx — REFACTORIZADO
 *
 * Reutiliza: useEntityList, StatusBadge, useConfirmDialog.
 * La validación de archivo (grupos activos / plan vinculado)
 * fue extraída a una función pura verifyCanArchive para mantener SRP.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Archive } from "lucide-react";

import type { Subject } from "../../models/uml/Subject";
import type { Action } from "../../models/interfaces/Action";

import { subjectService }    from "../../services/subjectService";
import { groupService }      from "../../services/groupService";
import { curriculumService } from "../../services/curriculumService";

import { useEntityList }    from "../../hooks/useEntityList";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";

import PageHeader          from "../../components/ui/PageHeader";
import TableToolbar        from "../../components/TableToolBar";
import GenericTable        from "../../components/ui/GenericTable";
import ArchiveSubjectModal from "../../components/modals/ArchiveSubjectModal";
import { StatusBadge }     from "../../components/ui/StatusBadge";

// ── Filtro ────────────────────────────────────────────────────────────────────
const filterSubject = (
  s: Subject,
  search: string,
  filterValues: Record<string, string>
) => {
  const matchSearch =
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase());
  const matchActive =
    !filterValues.is_active || String(s.is_active) === filterValues.is_active;
  const matchCredits =
    !filterValues.credits || String(s.credits) === filterValues.credits;
  return matchSearch && matchActive && matchCredits;
};

// ── Verifica si una asignatura puede archivarse (SRP: función pura) ───────────
async function verifyCanArchive(
  subject: Subject,
  alertFn: (title: string, text: string, icon?: "error") => void
): Promise<boolean> {
  const groups = await groupService.search({ subject_id: subject.id });
  if (groups.length > 0) {
    alertFn(
      "No se puede archivar",
      `${subject.name} tiene ${groups.length} grupo(s) activo(s). Finaliza los grupos antes de archivar.`
    );
    return false;
  }

  const allPlans = await curriculumService.getAll();
  for (const plan of allPlans) {
    if (!plan.id) continue;
    const planSubjects = await curriculumService.getSubjects(plan.id);
    if (planSubjects.some((s) => s.id === subject.id)) {
      alertFn(
        "No se puede archivar",
        `${subject.name} está vinculada al plan de estudios ${plan.name ?? plan.id}. Desvincula la asignatura primero.`
      );
      return false;
    }
  }
  return true;
}

// ── Componente ────────────────────────────────────────────────────────────────
const List: React.FC = () => {
  const navigate = useNavigate();
  const { alert } = useConfirmDialog();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selected, setSelected] = useState<Subject | null>(null);

  const { filteredData, data, filterValues, setSearch, handleFilterChange, handleClear, refresh } =
    useEntityList<Subject>({
      fetchFn: subjectService.getAll.bind(subjectService),
      filterFn: filterSubject,
    });

  // Opciones de créditos dinámicas según datos cargados
  const creditOptions = [...new Set(data.map((s) => s.credits))]
    .sort((a, b) => a - b)
    .map((c) => ({ label: String(c), value: String(c) }));

  const columns = [
    { key: "code",        label: "Código" },
    { key: "name",        label: "Nombre" },
    { key: "credits",     label: "Créditos" },
    { key: "description", label: "Descripción" },
    {
      key: "is_active",
      label: "Estado",
      render: (value: boolean) => (
        <StatusBadge active={value} trueLabel="Activa" falseLabel="Archivada" />
      ),
    },
  ];

  const actions: Action[] = [
    { name: "edit",    label: "Editar asignatura",   icon: <Pencil  size={16} />, primary: true, variant: "default" },
    { name: "archive", label: "Archivar asignatura",  icon: <Archive size={16} />, variant: "danger" },
  ];

  const handleAction = async (action: string, item: Subject) => {
    if (action === "edit") {
      navigate(`/subjects/edit/${item.id}`);
      return;
    }
    if (action === "archive") {
      const canArchive = await verifyCanArchive(item, (title, text) =>
        alert(title, text, "error")
      );
      if (!canArchive) return;
      setSelected(item);
      setArchiveOpen(true);
    }
  };

  const handleConfirmArchive = async () => {
    if (!selected?.id) return;
    const res = await subjectService.archive(selected.id);
    if (res) {
      alert("Archivada", "Asignatura archivada correctamente.", "success");
      refresh();
    } else {
      alert("Error", "No se pudo archivar la asignatura.", "error");
    }
    setArchiveOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Asignaturas"
        subtitle="Gestiona el catálogo de asignaturas del sistema."
        breadcrumb={["Inicio", "Asignaturas"]}
      />
      <TableToolbar
        searchPlaceholder="Buscar asignatura por nombre o código..."
        onSearchChange={setSearch}
        onClear={handleClear}
        actionLabel="Nueva asignatura"
        onAction={() => navigate("/subjects/create")}
        filters={[
          {
            key: "is_active",
            label: "Estado",
            options: [
              { label: "Activa",    value: "true"  },
              { label: "Archivada", value: "false" },
            ],
          },
          { key: "credits", label: "Créditos", options: creditOptions },
        ]}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />
      <GenericTable
        data={filteredData}
        columns={columns}
        actions={actions}
        onAction={handleAction}
      />
      <ArchiveSubjectModal
        isOpen={archiveOpen}
        onClose={() => { setArchiveOpen(false); setSelected(null); }}
        onConfirm={handleConfirmArchive}
        subjectName={selected?.name ?? ""}
        subjectCode={selected?.code ?? ""}
      />
    </div>
  );
};

export default List;