import React from "react";
import { Pencil, UserCheck, UserX } from "lucide-react";
import type { FilterConfig } from "../../models/interfaces/FilterConfig";
import GenericTable from "../../components/ui/GenericTable";
import type { Column } from "../../models/interfaces/Column";
import type { Action } from "../../models/interfaces/Action";
import TableToolbar from "../../components/TableToolBar";
import PageHeader from "../../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useUsersList, type UserListRow } from "../../hooks/useUsersList";

const List: React.FC = () => {
    const navigate = useNavigate();

    const {
        careers,
        activateUser,
        deactivateUser,
        filterValues,
        handleClear,
        handleFilterChange,
        setSearch,
        tableData,
    } = useUsersList();

    const FILTERS: FilterConfig[] = [
        {
            key: "role",
            label: "Rol",
            options: [
                { label: "Docente", value: "TEACHER" },
                { label: "Estudiante", value: "STUDENT" },
            ],
        },
        {
            key: "career_id",
            label: "Carrera (vía matrícula)",
            options: careers.map((c) => ({
                label: c.name,
                value: c.id,
            })),
        },
        {
            key: "is_active",
            label: "Estado",
            options: [
                { label: "Activo", value: "true" },
                { label: "Inactivo", value: "false" },
            ],
        },
    ];

    const COLUMNS: Column<UserListRow>[] = [
        { key: "code", label: "Código" },
        { key: "nombre", label: "Nombre" },
        { key: "email", label: "Correo" },
        {
            key: "role",
            label: "Rol",
            render: (value) => (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                        value === "TEACHER"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                >
                    {value === "TEACHER"
                        ? "Docente"
                        : "Estudiante"}
                </span>
            ),
        },
        { key: "careerLabel", label: "Carrera" },
        {
            key: "estado",
            label: "Estado",
            render: (value) => (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                        value === "Activo"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {String(value)}
                </span>
            ),
        },
        { key: "created_at", label: "Fecha creación" },
    ];

    const ACTIONS: Action[] = [
        {
            name: "edit",
            label: "Editar",
            icon: <Pencil size={16} />,
            primary: true,
        },
        { name: "activate", label: "Reactivar", icon: <UserCheck size={16} /> },
        { name: "deactivate", label: "Desactivar", icon: <UserX size={16} />, variant: "danger" },
    ];

    const handleAction = async (action: string, item: UserListRow) => {
        if (action === "edit") {
            navigate(`/users/edit/${item.id}`);
            return;
        }

        if (action === "activate") {
            if (item.estado === "Activo") {
                Swal.fire("Usuario activo", "Este usuario ya se encuentra activo.", "info");
                return;
            }

            const result = await Swal.fire({
                title: "Reactivar usuario",
                text: `El usuario ${item.nombre} podra acceder nuevamente al sistema.`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Reactivar",
                cancelButtonText: "Cancelar",
            });

            if (!result.isConfirmed) return;

            const ok = await activateUser(item.id);

            Swal.fire(
                ok ? "Usuario reactivado" : "No se pudo reactivar",
                ok ? "El estado del usuario fue actualizado." : "Intenta nuevamente.",
                ok ? "success" : "error"
            );
            return;
        }

        if (action !== "deactivate") return;

        if (item.estado === "Inactivo") {
            Swal.fire("Usuario inactivo", "Este usuario ya se encuentra desactivado.", "info");
            return;
        }

        const result = await Swal.fire({
            title: "Desactivar usuario",
            text: `El usuario ${item.nombre} no podra acceder al sistema.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Desactivar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc2626",
        });

        if (!result.isConfirmed) return;

        const ok = await deactivateUser(item.id);

        Swal.fire(
            ok ? "Usuario desactivado" : "No se pudo desactivar",
            ok ? "El estado del usuario fue actualizado." : "Intenta nuevamente.",
            ok ? "success" : "error"
        );
    };

    return (
        <div>
            <PageHeader
                title="Usuarios"
                subtitle="Gestión de usuarios"
                breadcrumb={["Inicio", "Usuarios"]}
            />

            <TableToolbar
                searchPlaceholder="Buscar..."
                filters={FILTERS}
                filterValues={filterValues}
                onSearchChange={setSearch}
                onFilterChange={handleFilterChange}
                onClear={handleClear}
                actionLabel="Nuevo usuario"
                onAction={() => navigate("/users/create")}
            />

            <GenericTable
                data={tableData}
                columns={COLUMNS}
                actions={ACTIONS}
                onAction={handleAction}
            />
        </div>
    );
};

export default List;
