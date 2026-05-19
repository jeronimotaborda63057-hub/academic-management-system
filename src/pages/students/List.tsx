import React, { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/ui/GenericTable";

import { studentService } from "../../services/studentService";

import type { Student } from "../../models/Student";
import type { Column } from "../../models/Column";

// S: única responsabilidad — listar y gestionar acciones sobre estudiantes
const List: React.FC = () => {
    const [data, setData] = useState<Student[]>([]);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        const students = await studentService.getAll();
        setData(students ?? []);
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


    // I: Column<Student> tipado solo con lo que esta vista necesita
    const columns: Column<Student>[] = [
        {
            key: "identification",
            label: "Identificación",
        },
        {
            key: "first_name",
            label: "Nombre",
            render: (_: unknown, row: Student) => (
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
                title="Estudiantes"
                subtitle="Gestiona los estudiantes del sistema."
                breadcrumb={["Inicio", "Estudiantes"]}
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