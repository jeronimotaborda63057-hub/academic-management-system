import React, { useEffect, useState, useCallback } from "react";
import type { User, UserFilters } from "../../models/User";
import GenericTable from "../../components/GenericTable";
import TableToolbar from "../../components/TableToolBar";
import PageHeader from "../../components/PageHeader";
import type { FilterConfig } from "../../components/TableToolBar";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const USER_FILTERS: FilterConfig[] = [
    {
        key: "role",
        label: "Rol",
        options: [
            { label: "Docente", value: "TEACHER" },
            { label: "Estudiante", value: "STUDENT" },
            { label: "Admin", value: "ADMIN" },
        ],
    },
    {
        key: "is_active",
        label: "Estado",
        options: [
            { label: "Activo", value: "true" },
            { label: "Inactivo", value: "false" },
        ],
    },
    /* 
    {
        key: "careers",
        label: "Carrera (por matricula)",
        options: [
            { label: "a", value: ""},
            {}
        ]
    },
 */
];

const ListUsers: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});

    const fetchData = useCallback(async () => {
        const filters: UserFilters = {
            ...(filterValues.role ? { role: filterValues.role as any } : {}),
            ...(filterValues.is_active !== undefined && filterValues.is_active !== ""
                ? { is_active: filterValues.is_active === "true" }
                : {}),
            ...(search ? { first_name: search } : {}),
        };

        const hasFilters = Object.keys(filters).length > 0;
        const users = hasFilters
            ? await userService.search(filters)
            : await userService.getAll();

        setData(users);
    }, [filterValues, search]);

    useEffect(() => {
        const timeout = setTimeout(() => fetchData(), 400);
        return () => clearTimeout(timeout);
    }, [fetchData]);

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleClear = () => {
        setSearch("");
        setFilterValues({});
    };

    const handleAction = (action: string, item: Record<string, any>) => {
        if (action === "edit") navigate(`/users/update/${item.id}`);
        else if (action === "deactivate") deactivateUser(item.id);
    };

    const deactivateUser = async (id: string) => {
        Swal.fire({
            title: "¿Desactivar usuario?",
            text: "El usuario perderá acceso al sistema.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, desactivar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const deactivated = await userService.deactivate(id);
                if (deactivated) {
                    Swal.fire("Desactivado", "El usuario ha sido desactivado.", "success");
                    fetchData();
                } else {
                    Swal.fire("Error", "No se pudo desactivar el usuario.", "error");
                }
            }
        });
    };

    const tableData = data.map((user) => ({
        ...user,
        nombre: user.profile
            ? `${user.profile.first_name} ${user.profile.last_name}`
            : "—",
        estado: user.is_active ? "Activo" : "Inactivo",
    }));

    return (
        <div>
            <PageHeader
                title="Usuarios"
                subtitle="Gestiona las cuentas de docentes y estudiantes del sistema."
                breadcrumb={["Inicio", "Usuarios"]}
            />
            <TableToolbar
                searchPlaceholder="Buscar por nombre, email o código..."
                filters={USER_FILTERS}
                filterValues={filterValues}
                onSearchChange={setSearch}
                onFilterChange={handleFilterChange}
                onClear={handleClear}
                actionLabel="Nuevo usuario"
                onAction={() => navigate("/users/create")}
            />
            <GenericTable
                data={tableData}
                columns={["code", "nombre", "email", "role", "careers", "estado", "created_at"]}
                actions={[
                    { name: "edit", label: "Editar" },
                    { name: "deactivate", label: "Desactivar" },
                ]}
                onAction={handleAction}
            />
        </div>
    );
};

export default ListUsers;