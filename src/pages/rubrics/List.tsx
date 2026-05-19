/**
 * pages/rubrics/List.tsx — REFACTORIZADO
 *
 * Reutiliza: useEntityList, StatusBadge (en lugar de RubricStatusBadge inline),
 * useConfirmDialog.
 *
 * Nota: RubricStatusBadge sigue existiendo para los casos con 3 estados
 * (borrador / publicada / archivada). StatusBadge cubre el caso binario.
 * Aquí mantenemos RubricStatusBadge porque la rúbrica tiene 3 estados.
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Archive, Trash2, ArchiveRestore } from "lucide-react";

import type { Rubric } from "../../models/uml/Rubric";
import type { Action } from "../../models/interfaces/Action";
import type { Column } from "../../models/interfaces/Column";

import { rubricService }   from "../../services/rubricService";
import { criteriaService } from "../../services/criteriaService";

import { useEntityList }    from "../../hooks/useEntityList";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";

import PageHeader          from "../../components/ui/PageHeader";
import TableToolbar        from "../../components/TableToolBar";
import GenericTable        from "../../components/ui/GenericTable";
import RubricStatusBadge   from "../../components/rubrics/RubricStatusBadge";

// ── Filtro ────────────────────────────────────────────────────────────────────
const filterRubric = (
  r: Rubric,
  search: string,
  filterValues: Record<string, string>
) => {
  const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase()) ?? true;
  const matchStatus =
    filterValues.status === "" ||
    !filterValues.status ||
    (filterValues.status === "archived"  &&  r.is_archived) ||
    (filterValues.status === "published" &&  r.is_public && !r.is_archived) ||
    (filterValues.status === "draft"     && !r.is_public && !r.is_archived);
  return matchSearch && matchStatus;
};

// ── Componente ────────────────────────────────────────────────────────────────
const List: React.FC = () => {
  const navigate = useNavigate();
  const { confirm, alert } = useConfirmDialog();

  const { filteredData, filterValues, setSearch, handleFilterChange, handleClear, refresh, data } =
    useEntityList<Rubric>({
      fetchFn: async () => {
        const [rubrics, allCriteria] = await Promise.all([
          rubricService.getAll(),
          criteriaService.getAll(),
        ]);
        if (!rubrics?.length) return [];
        const countByRubric = allCriteria.reduce<Record<string, number>>((acc, c) => {
          if (c.rubric_id) acc[String(c.rubric_id)] = (acc[String(c.rubric_id)] ?? 0) + 1;
          return acc;
        }, {});
        return rubrics.map((r) => ({
          ...r,
          criteria: Array(countByRubric[String(r.id)] ?? 0).fill(null),
        }));
      },
      filterFn: filterRubric,
    });

  // Cierra el menú dropdown al hacer scroll (comportamiento original mantenido)
  useEffect(() => {
    const close = () => document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, []);

  const handleAction = async (action: string, item: Rubric) => {
    switch (action) {
      case "edit":
        navigate(`/rubrics/edit/${item.id}`);
        break;

      case "archive": {
        const ok = await confirm({
          title: "¿Archivar rúbrica?",
          text: `"${item.title}" será archivada.`,
          variant: "danger",
          confirmLabel: "Sí, archivar",
        });
        if (!ok) return;
        try {
          await rubricService.archive(item.id!);
          alert("Archivada", "La rúbrica fue archivada.", "success");
          refresh();
        } catch {
          alert("Error", "No se pudo archivar la rúbrica.", "error");
        }
        break;
      }

      case "unarchive": {
        const ok = await confirm({
          title: "¿Desarchivar rúbrica?",
          text: `"${item.title}" volverá a estar disponible como borrador.`,
          variant: "question",
          confirmLabel: "Desarchivar",
        });
        if (!ok) return;
        try {
          await rubricService.unarchive(item.id!);
          alert("Desarchivada", "La rúbrica está disponible nuevamente.", "success");
          refresh();
        } catch {
          alert("Error", "No se pudo desarchivar la rúbrica.", "error");
        }
        break;
      }

      case "delete": {
        const ok = await confirm({
          title: "¿Eliminar borrador?",
          text: `"${item.title}" se eliminará permanentemente.`,
          variant: "danger",
          confirmLabel: "Eliminar",
        });
        if (!ok) return;
        const deleted = await rubricService.deleteById(item.id!);
        if (deleted) {
          alert("Eliminada", "Borrador eliminado.", "success");
          refresh();
        } else {
          alert("Error", "No se pudo eliminar el borrador.", "error");
        }
        break;
      }
    }
  };

  const columns: Column<Rubric>[] = [
    { key: "title",       label: "Título" },
    { key: "description", label: "Descripción" },
    {
      key: "is_public",
      label: "Estado",
      render: (_val, row) => (
        <RubricStatusBadge isPublic={row.is_public} isArchived={row.is_archived} />
      ),
    },
    {
      key: "criteria",
      label: "Criterios",
      render: (_val, row) => (
        <span className="text-sm text-gray-500">{row.criteria?.length ?? 0}</span>
      ),
    },
  ];

  const actions: Action[] = [
    { name: "edit",      label: "Editar",            icon: <Pencil        size={16} />, primary: true, variant: "default" },
    { name: "archive",   label: "Archivar",           icon: <Archive       size={16} />, variant: "danger"  },
    { name: "unarchive", label: "Desarchivar",        icon: <ArchiveRestore size={16} />, variant: "default" },
    { name: "delete",    label: "Eliminar borrador",  icon: <Trash2        size={16} />, variant: "danger"  },
  ];

  return (
    <div>
      <PageHeader
        title="Rúbricas"
        subtitle="Gestiona tus instrumentos de evaluación."
        breadcrumb={["Inicio", "Rúbricas"]}
      />
      <TableToolbar
        searchPlaceholder="Buscar rúbrica por título..."
        onSearchChange={setSearch}
        onClear={handleClear}
        actionLabel="Nueva rúbrica"
        onAction={() => navigate("/rubrics/create")}
        filters={[{
          key: "status",
          label: "Estado",
          options: [
            { value: "draft",     label: "Borrador"  },
            { value: "published", label: "Publicada" },
          ],
        }]}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />
      <div className="pb-40">
        <GenericTable
          data={filteredData}
          columns={columns}
          actions={actions}
          onAction={handleAction}
        />
      </div>
    </div>
  );
};

export default List;