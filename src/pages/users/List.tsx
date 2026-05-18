import React from "react";
import { Pencil, UserX } from "lucide-react";
import type { FilterConfig } from "../../models/interfaces/FilterConfig";
import GenericTable from "../../components/ui/GenericTable";
import type { Column } from "../../models/interfaces/Column";
import type { Action } from "../../models/interfaces/Action";
import TableToolbar from "../../components/TableToolBar";
import PageHeader from "../../components/ui/PageHeader";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useUsersList, type UserListRow } from "../../hooks/useUsersList";

const List: React.FC = () => {
    const navigate = useNavigate();
    const {
        careers,
        fetchData,
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
            options: careers.map((career) => ({
                label: career.name,
                value: career.id,
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
        {
            key: "code",
            label: "Código",
        },
        {
            key: "nombre",
            label: "Nombre",
        },
        {
            key: "email",
            label: "Correo",
        },
        {
            key: "role",
            label: "Rol",
            render: (value: UserListRow["role"]) => (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${value === "TEACHER"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                        }`}
                >
                    {value === "TEACHER"
                        ? "Docente"
                        : value === "STUDENT"
                            ? "Estudiante"
                            : value}
                </span>
            ),
        },
        {
            key: "careerLabel",
            label: "Carrera",
            render: (value: string) => <span>{value}</span>,
        },
        {
            key: "estado",
            label: "Estado",
            render: (value: UserListRow["estado"]) => (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${value === "Activo"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {value}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Fecha creación",
            render: (value: string | number | Date) => (
                <span>
                    {new Date(value).toLocaleDateString("es-CO")}
                </span>
            ),
        },
    ];

    const ACTIONS: Action[] = [
        {
            name: "edit",
            label: "Editar usuario",
            icon: (
                <Pencil
                    size={16}
                    className="text-gray-700"
                />
            ),
            primary: true,
            variant: "default",
        },
        {
            name: "deactivate",
            label: "Desactivar usuario",
            icon: (
                <UserX
                    size={16}
                    className="text-red-600"
                />
            ),
            variant: "danger",
        },
    ];

    const handleAction = (
        action: string,
        item: UserListRow
    ) => {
        if (action === "edit")
            navigate(`/users/edit/${item.id}`);
        else if (action === "deactivate")
            deactivateUser(item.id);
    };

    const deactivateUser = async (id: string) => {
        Swal.fire({
            title: "¿Desactivar usuario?",
            text: "El usuario perderá acceso al sistema.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Desactivar",
            cancelButtonText: "Cancelar",
            buttonsStyling: false,
            customClass: {
                confirmButton: "swal-confirm-btn",
                cancelButton: "swal-cancel-btn",
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const deactivated =
                    await userService.deactivate(id);

                if (deactivated) {
                    Swal.fire({
                        title: "Desactivado",
                        text: "El usuario ha sido desactivado.",
                        icon: "success",
                        confirmButtonText: "Aceptar",
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: "swal-confirm-btn",
                        },
                    });

                    fetchData();
                } else {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo desactivar el usuario.",
                        icon: "error",
                        confirmButtonText: "Aceptar",
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: "swal-error-btn",
                        },
                    });
                }
            }
        });
    };

    return (
        <div>
            <PageHeader
                title="Usuarios"
                subtitle="Gestiona las cuentas de docentes y estudiantes del sistema."
                breadcrumb={["Inicio", "Usuarios"]}
            />

            <TableToolbar
                searchPlaceholder="Buscar por nombre, email o código..."
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
