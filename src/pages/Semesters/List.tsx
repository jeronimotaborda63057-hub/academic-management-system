import React, { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/ui/GenericTable";
import { semesterService } from "../../services/semesterService";
import type { Semester } from "../../models/Semester";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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

    const actions = [
        {
            name: "edit",
            label: "Editar",
            icon: <Pencil size={18} />,
            primary: true,
        },
    ];

    const handleAction = async (action: string, semester: any) => {
        try {
            if (action === "edit") {
                navigate(`/semesters/edit/${semester.id}`);
            }

            if (action === "toggle") {
                const newStatus = !semester.is_active;

                await semesterService.update(semester.id, {
                    ...semester,
                    is_active: newStatus,
                });

                await Swal.fire({
                    icon: "success",
                    title: "Actualizado",
                    text: `Semestre ${newStatus ? "activado" : "desactivado"}`,
                });

            }
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo realizar la acción",
            });
        }
    };

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
                onFilterChange={() => { }}
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
