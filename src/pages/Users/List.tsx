import React, { useEffect, useState, useCallback } from "react";
import { Pencil, UserX, Eye } from "lucide-react";
import type { User } from "../../models/User";
import type { Career } from "../../models/Career";
import type { FilterConfig } from "../../models/FilterConfig";
import type { UserFilters } from "../../models/UserFilters";
import GenericTable from "../../components/GenericTable";
import type { Column } from "../../models/Column";
import type { Action } from "../../models/Action";
import TableToolbar from "../../components/TableToolBar";
import PageHeader from "../../components/common/PageHeader";
import { userService } from "../../services/userService";
import { careerService } from "../../services/careerService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const List: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<User[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
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

    const COLUMNS: Column<User>[] = [
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
            render: (value: any) => (
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
            key: "careers",
            label: "Carrera",
            render: (value: any[]) => (
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
            render: (value: any) => (
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
    {
        name: "view",
        label: "Ver detalle",
        icon: (
            <Eye
                size={16}
                className="text-blue-600"
            />
        ),
        variant: "default",
    },
];

    useEffect(() => {
        const loadCareers = async () => {
            try {
                const careersData = await careerService.getAll();
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
            ...(filterValues.career_id
                ? { career_id: filterValues.career_id }
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

    const handleAction = (
        action: string,
        item: Record<string, any>
    ) => {
        if (action === "edit")
            navigate(`/users/edit/${item.id}`);
        else if (action === "deactivate")
            deactivateUser(item.id);
        else if (action === "view")
            navigate(`/users/detail/${item.id}`);
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
                columns={COLUMNS}
                actions={ACTIONS}
                onAction={handleAction}
            />
        </div>
    );
};

export default List;