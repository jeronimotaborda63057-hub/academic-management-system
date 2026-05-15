import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Archive, Eye, Trash2, ArchiveRestore } from "lucide-react";
import Swal from "sweetalert2";
import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/ui/GenericTable";
import RubricStatusBadge from "../../components/rubrics/RubricStatusBadge";
import { rubricService } from "../../services/rubricService";
import { criteriaService } from "../../services/criteriaService";
import type { Rubric } from "../../models/Rubric";
import type { Action } from "../../models/Action";
import type { Column } from "../../models/Column";

const List: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Rubric[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ✅ FIX: fetchData solo hace el fetch y el setData, nada más
  const fetchData = async () => {
    const [rubrics, allCriteria] = await Promise.all([
      rubricService.getAll(),
      criteriaService.getAll(),
    ]);

    if (!rubrics?.length) {
      setData([]);
      return;
    }

    const countByRubric = allCriteria.reduce<Record<string, number>>(
      (acc, c) => {
        if (c.rubric_id) {
          const id = String(c.rubric_id);
          acc[id] = (acc[id] ?? 0) + 1;
        }
        return acc;
      },
      {},
    );

    setData(
      rubrics.map((r) => ({
        ...r,
        criteria: Array(countByRubric[String(r.id)] ?? 0).fill(null),
      })),
    );
  };

  // ✅ FIX: useEffect al nivel del componente, no dentro de fetchData
  useEffect(() => {
    fetchData();
  }, []);

  // ✅ FIX: cerrar el menú dropdown de GenericTable cuando el usuario hace scroll,
  // para evitar que quede flotando en una posición incorrecta.
  // Se simula un click fuera del menú (dispara el handler mousedown de GenericTable).
  useEffect(() => {
    const closeMenuOnScroll = () => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    };
    window.addEventListener("scroll", closeMenuOnScroll, true);
    return () => window.removeEventListener("scroll", closeMenuOnScroll, true);
  }, []);

  // ✅ FIX: handleAction al nivel del componente
  const handleAction = async (action: string, item: Rubric) => {
    switch (action) {
      case "edit":
        navigate(`/rubrics/edit/${item.id}`);
        break;

      case "view":
        navigate(`/rubrics/detail/${item.id}`);
        break;

      case "archive": {
        const { isConfirmed } = await Swal.fire({
          title: "¿Eliminar borrador?",
          text: `"${item.title}" se eliminará permanentemente.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#dc2626",
          cancelButtonColor: "#6b7280",
          background: "#1f2937",
          color: "#f9fafb",
          width: "32rem",
          reverseButtons: true,
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "px-4 py-2 rounded-lg",
            cancelButton: "px-4 py-2 rounded-lg",
          },
        });
        if (isConfirmed) {
          try {
            await rubricService.archive(item.id!);
            Swal.fire("Archivada", "La rúbrica fue archivada.", "success");
            fetchData();
          } catch {
            Swal.fire("Error", "No se pudo archivar la rúbrica.", "error");
          }
        }
        break;
      }

      case "unarchive": {
        const { isConfirmed } = await Swal.fire({
          title: "¿Desarchivar rúbrica?",
          text: `"${item.title}" volverá a estar disponible como borrador.`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Desarchivar",
          cancelButtonText: "Cancelar",
        });
        if (isConfirmed) {
          try {
            await rubricService.unarchive(item.id!);
            Swal.fire(
              "Desarchivada",
              "La rúbrica está disponible nuevamente.",
              "success",
            );
            fetchData();
          } catch {
            Swal.fire("Error", "No se pudo desarchivar la rúbrica.", "error");
          }
        }
        break;
      }

      case "delete": {
        const { isConfirmed } = await Swal.fire({
          title: "¿Eliminar borrador?",
          text: `"${item.title}" se eliminará permanentemente.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Eliminar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#d33",
        });
        if (isConfirmed) {
          const ok = await rubricService.deleteById(item.id!);
          if (ok) {
            Swal.fire("Eliminada", "Borrador eliminado.", "success");
            fetchData();
          } else {
            Swal.fire("Error", "No se pudo eliminar el borrador.", "error");
          }
        }
        break;
      }
    }
  };

  // ✅ FIX: filteredData, columns, actions y return al nivel del componente
  const filteredData = data.filter((r) => {
    const matchSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ?? true;
    const matchStatus =
      statusFilter === "" ||
      (statusFilter === "archived" && r.is_archived) ||
      (statusFilter === "published" && r.is_public && !r.is_archived) ||
      (statusFilter === "draft" && !r.is_public && !r.is_archived);
    return matchSearch && matchStatus;
  });

  const columns: Column<Rubric>[] = [
    { key: "title", label: "Título" },
    { key: "description", label: "Descripción" },
    {
      key: "is_public",
      label: "Estado",
      render: (_val, row) => (
        <RubricStatusBadge
          isPublic={row.is_public}
          isArchived={row.is_archived}
        />
      ),
    },
    {
      key: "criteria",
      label: "Criterios",
      render: (_val, row) => (
        <span className="text-sm text-gray-500">
          {row.criteria?.length ?? 0}
        </span>
      ),
    },
  ];

  const actions: Action[] = [
    {
      name: "edit",
      label: "Editar",
      icon: <Pencil size={16} />,
      primary: true,
      variant: "default",
    },
    {
      name: "view",
      label: "Ver detalle",
      icon: <Eye size={16} />,
      variant: "default",
    },
    {
      name: "archive",
      label: "Archivar",
      icon: <Archive size={16} />,
      variant: "danger",
    },
    {
      name: "unarchive",
      label: "Desarchivar",
      icon: <ArchiveRestore size={16} />,
      variant: "default",
    },
    {
      name: "delete",
      label: "Eliminar borrador",
      icon: <Trash2 size={16} />,
      variant: "danger",
    },
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
        onClear={() => {
          setSearch("");
          setStatusFilter("");
        }}
        actionLabel="Nueva rúbrica"
        onAction={() => navigate("/rubrics/create")}
        filters={[
          {
            key: "status",
            label: "Estado",
            options: [
              { value: "draft", label: "Borrador" },
              { value: "published", label: "Publicada" },
              { value: "archived", label: "Archivada" },
            ],
          },
        ]}
        filterValues={{ status: statusFilter }}
        onFilterChange={(key, value) => {
          if (key === "status") setStatusFilter(value);
        }}
      />

      {/* ✅ pb-40: evita que el dropdown del último elemento se corte */}
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