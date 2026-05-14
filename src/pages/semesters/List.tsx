import React, { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/common/GenericTable";
import { semesterService } from "../../services/semesterService";
import type { Semester } from "../../models/Semester";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const List: React.FC = () => {
    const [data, setData] = useState<Semester[]>([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        semesterService.getAll().then(setData);
    }, []);

    const filteredData = data.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre" },
        {
            key: "start_date",
            label: "Inicio",
            render: (v: string) => new Date(v).toLocaleDateString(),
        },
        {
            key: "end_date",
            label: "Fin",
            render: (v: string) => new Date(v).toLocaleDateString(),
        },
        {
            key: "is_active",
            label: "Estado",
            render: (v: boolean) => (v ? "Activo" : "Cerrado"),
        },
    ];

    return (
        <div>
            <PageHeader 
            title="Semestres"
            subtitle="Gestiona los semestres" />


            <TableToolbar
                searchPlaceholder="Buscar..."
                onSearchChange={setSearch}
                onClear={() => setSearch("")}
                actionLabel="Nuevo"
                onAction={() => navigate("/semesters/create")}
                filters={[]}
                filterValues={{}}
                onFilterChange={() => {}}
            />

            <GenericTable
                data={filteredData}
                columns={columns}
                actions={[
                    {
                        name: "edit",
                        label: "Editar",
                        icon: <Pencil size={16} />,
                    },
                ]}
                onAction={(a, item) =>
                    navigate(`/semesters/edit/${item.id}`)
                }
            />
        </div>
    );
};

export default List;