import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Archive, Eye } from "lucide-react";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/GenericTable";
import RubricStatusBadge from "../../components/rubrics/RubricStatusBadge";
import { rubricService } from "../../services/rubricService";
import type { Rubric } from "../../models/Rubric";
import type { Action } from "../../models/Action";
import type { Column } from "../../models/Column";

/**
 * List — página que lista todas las rúbricas del docente.
 *
 * Principio SOLID:
 *  - SRP: solo orquesta la vista de listado. La lógica de API está en rubricService.
 *  - DIP: depende de rubricService (abstracción) no de axios directamente.
 */

const List: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<Rubric[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchData = async () => {
        const rubrics = await rubricService.getAll();
        setData(rubrics ?? []);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAction = async (action: string, item: Rubric) => {
        switch (action) {
            case "edit":
                navigate(`/rubrics/edit/${item.id}`);
                break;

            case "view":
                navigate(`/rubrics/detail/${item.id}`);
                break;

            case "archive":
                // Solo rúbricas publicadas llegan aquí; las borrador se eliminan
                const confirm = await Swal.fire({
                    title: "¿Archivar rúbrica?",
                    text: `"${item.title}" quedará archivada y no podrá usarse en nuevas evaluaciones.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Archivar",
                    cancelButtonText: "Cancelar",
                    confirmButtonColor: "#d33",
                });
                if (confirm.isConfirmed) {
                    const res = await rubricService.archive(item.id!);
                    if (res) {
                        Swal.fire("Archivada", "La rúbrica fue archivada.", "success");
                        fetchData();
                    }
                }
                break;

            case "delete":
                // Solo borrador se puede eliminar
                const confirmDel = await Swal.fire({
                    title: "¿Eliminar borrador?",
                    text: `"${item.title}" se eliminará permanentemente.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Eliminar",
                    cancelButtonText: "Cancelar",
                    confirmButtonColor: "#d33",
                });
                if (confirmDel.isConfirmed) {
                    const res = await rubricService.delete(Number(item.id));
                    if (res) {
                        Swal.fire("Eliminada", "Borrador eliminado.", "success");
                        fetchData();
                    }
                }
                break;
        }
    };

    // Filtrado local
    const filteredData = data.filter((r) => {
        const matchSearch =
            r.title?.toLowerCase().includes(search.toLowerCase()) ?? true;
        const matchStatus =
            statusFilter === "" ||
            (statusFilter === "archived" ? r.is_archived : r.status === statusFilter && !r.is_archived);
        return matchSearch && matchStatus;
    });

    const columns: Column<Rubric>[] = [
        { key: "title", label: "Título" },
        { key: "description", label: "Descripción" },
        {
            key: "status",
            label: "Estado",
            render: (_val, row) => (
                <RubricStatusBadge status={row.status} isArchived={row.is_archived} />
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

    const getActions = (item: Rubric): Action[] => {
        const base: Action[] = [
            { name: "edit",  label: "Editar", icon: <Pencil size={16} />, primary: true, variant: "default" },
            { name: "view",  label: "Ver detalle", icon: <Eye size={16} />, variant: "default" },
        ];

        if (item.status === "published" && !item.is_archived) {
            base.push({ name: "archive", label: "Archivar", icon: <Archive size={16} />, variant: "danger" });
        }

        if (item.status === "draft" && !item.is_archived) {
            base.push({ name: "delete", label: "Eliminar borrador", icon: <Archive size={16} />, variant: "danger" });
        }

        return base;
    };

    // GenericTable usa acciones fijas; pasamos las acciones globales más comunes
    const actions: Action[] = [
        { name: "edit",    label: "Editar",            icon: <Pencil size={16} />,  primary: true, variant: "default" },
        { name: "view",    label: "Ver detalle",        icon: <Eye size={16} />,     variant: "default" },
        { name: "archive", label: "Archivar",           icon: <Archive size={16} />, variant: "danger" },
        { name: "delete",  label: "Eliminar borrador",  icon: <Archive size={16} />, variant: "danger" },
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
                onClear={() => { setSearch(""); setStatusFilter(""); }}
                actionLabel="Nueva rúbrica"
                onAction={() => navigate("/rubrics/create")}
                filters={[
                    {
                        key: "status",
                        label: "Estado",
                        options: [
                            { value: "draft",     label: "Borrador"  },
                            { value: "published", label: "Publicada" },
                            { value: "archived",  label: "Archivada" },
                        ],
                    },
                ]}
                filterValues={{ status: statusFilter }}
                onFilterChange={(key, value) => {
                    if (key === "status") setStatusFilter(value);
                }}
            />

            <GenericTable
                data={filteredData}
                columns={columns}
                actions={actions}
                onAction={handleAction}
            />
        </div>
    );
};

export default List;