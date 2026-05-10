import React, { useEffect, useState, useCallback } from "react";
import type { Career } from "../../models/Career";
import GenericTable from "../../components/GenericTable";
import TableToolbar from "../../components/TableToolBar";
import PageHeader from "../../components/PageHeader";
import { userService } from "../../services/userService";
import { careerService } from "../../services/careerService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import type { FilterConfig } from "../../models/FilterConfig";
import type { UserFilters } from "../../models/UserFilters";
import type { User } from "../../models/User";

const List: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<User[]>([]);
    const [careers, setCareers] = useState<Career[]>([])
    const [search, setSearch] = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});

    const FILTERS: FilterConfig[] = [
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
            key: "career_id",
            label: "Carrera (vía matrícula)",
            options: [
                ...careers.map((career) => ({
                    label: career.name,
                    value: career.id,
                })),
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
    ];

    useEffect(() => {
        const loadCareers = async () => {
            try {
                const careersData = await careerService.getAll();
                console.log(careersData);
                setCareers(careersData);

            } catch (error) {
                console.error("Error loading careers", error);
            }
        };

        loadCareers();
    }, []);

    const fetchData = useCallback(async () => {
        const filters: UserFilters = {
            ...(filterValues.role
                ? { role: filterValues.role as any }
                : {}),

            ...(filterValues.is_active !== undefined &&
                filterValues.is_active !== ""
                ? { is_active: filterValues.is_active === "true" }
                : {}),

            ...(filterValues.careers
                ? { career_id: filterValues.careers }
                : {}),

            ...(search
                ? { first_name: search }
                : {}),
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
        setFilterValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleClear = () => {
        setSearch("");
        setFilterValues({});
    };

    const handleAction = (
        action: string,
        item: Record<string, any>
    ) => {
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
                const deactivated = await userService.desactivate(id);
                if (deactivated) {
                    Swal.fire("Desactivado", "El usuario ha sido desactivado.", "success");
                    fetchData();
                } else {
                    Swal.fire("Error", "No se pudo desactivar el usuario.", "error");
                }
            }
        });
    };

    const tableData = data
        .filter(
            (user) =>
                user.role === "TEACHER" ||
                user.role === "STUDENT"
        )
        .map((user) => ({
            ...user,

            nombre: user.profile
                ? `${user.profile.first_name} ${user.profile.last_name}`
                : "Sin información",

            estado: user.is_active
                ? "Activo"
                : "Inactivo",
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
                columns={[
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

                        render: (value) => (
                            <span className={`rounded-full px-3 py-1 text-xs font-medium 
                                ${value === "TEACHER"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-blue-100 text-blue-700"
                                    }
                                `}
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
                        key: "careers",
                        label: "Carrera",

                        render: (value) => (
                            <span>
                                {Array.isArray(value)
                                    ? value.map((c: any) => c.name).join(", ")
                                    : "-"}
                            </span>
                        ),
                    },

                    {
                        key: "estado",
                        label: "Estado",

                        render: (value) => (
                            <span
                                className={`
                rounded-full
                px-3
                py-1
                text-xs
                font-medium

                ${value === "Activo"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }
            `}
                            >
                                {value}
                            </span>
                        ),
                    },

                    {
                        key: "created_at",
                        label: "Fecha creación",

                        render: (value) => (
                            <span>
                                {new Date(value)
                                    .toLocaleDateString("es-CO")}
                            </span>
                        ),
                    },
                ]}
                actions={[
                    { name: "edit", label: "Editar" },
                    { name: "deactivate", label: "Desactivar" },
                ]}
                onAction={handleAction}
            />
        </div>
    );
};

export default List;