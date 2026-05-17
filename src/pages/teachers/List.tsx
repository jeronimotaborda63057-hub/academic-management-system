import React, { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/ui/GenericTable";

import { teacherService } from "../../services/teacherService";

import type { Teacher } from "../../models/Teacher";
import type { Column } from "../../models/Column";

// S: única responsabilidad — listar y gestionar acciones sobre estudiantes
const List: React.FC = () => {
    const [data, setData] = useState<Teacher[]>([]);
    const [search, setSearch] = useState("");

    const fetchData = async () => { 
        const Teachers = await teacherService.getAll();
        setData(Teachers ?? []);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = data.filter(
        (s) =>
            s.first_name?.toLowerCase().includes(search.toLowerCase()) ||
            s.last_name?.toLowerCase().includes(search.toLowerCase()) ||
            s.identification?.toLowerCase().includes(search.toLowerCase())
    );


    // I: Column<Teacher> tipado solo con lo que esta vista necesita
    const columns: Column<Teacher>[] = [
        {
            key: "identification",
            label: "Identificación",
        },
        {
            key: "first_name",
            label: "Nombre",
            render: (_: unknown, row: Teacher) => (
                <span className="font-medium text-gray-900">
                    {row.first_name} {row.last_name}
                </span>
            ),
        },
        {
            key: "user_id",
            label: "Usuario ID",
            render: (value: string) => (
                <span className="font-mono text-xs text-gray-400 truncate block max-w-[140px]">
                    {value ?? "—"}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Registrado",
            render: (value: string) => (
                <span className="text-xs text-gray-400">
                    {formatDate(value)}
                </span>
            ),
        },
    ];

    

    return (
        <div>
            <PageHeader
                title="Docentes"
                subtitle="Revisa los docentes del sistema."
                breadcrumb={["Inicio", "Docentes"]}
            />

            <TableToolbar
                searchPlaceholder="Buscar por nombre o identificación..."
                onSearchChange={setSearch}
                onClear={() => setSearch("")}
                filters={[]}
                filterValues={{}}
                onFilterChange={() => {}}
            />

            <GenericTable
                data={filteredData}
                columns={columns}
            />
        </div>
    );
};

export default List;

// ── Utilidad interna ───────────────────────────────────────────────

const formatDate = (iso?: string): string => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};