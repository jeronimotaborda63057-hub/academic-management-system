import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import { careerService } from "../../services/careerService";
import type { Career } from "../../models/Career";
import { Pencil, Archive, Eye } from "lucide-react";
import Swal from "sweetalert2";
import CareerFormModal from "../../components/CareerFormModal";
import type { Action } from "../../models/Action";
import GenericTable from "../../components/GenericTable";

const List: React.FC = () => {
    const [data, setData] = useState<Career[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState<Career | null>(null);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        const careers = await careerService.getAll();
        setData(careers ?? []);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = (action: string, item: Career) => {
        switch (action) {
            case "edit":
                setSelected(item);
                setModalOpen(true);
                break;

            case "archive":
                archiveCareer(item.id);
                break;

            case "view":
                console.log(item);
                break;
        }
    };

    const archiveCareer = async (id: string) => {
        const result = await Swal.fire({
            title: "¿Archivar carrera?",
            text: "La carrera dejará de estar disponible",
            icon: "warning",
            showCancelButton: true,
        });

        if (result.isConfirmed) {
            const res = await careerService.archive(id);

            if (res) {
                Swal.fire(
                    "Archivada",
                    "Carrera archivada correctamente",
                    "success"
                );
                fetchData();
            }
        }
    };

    const handleSubmit = async (form: any) => {
        if (selected) {
            await careerService.update(selected.id, form);
        } else {
            await careerService.create(form);
        }

        setModalOpen(false);
        setSelected(null);
        fetchData();
    };

    const filteredData = (data ?? []).filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre" },
        { key: "description", label: "Descripción" },
        {
            key: "is_active",
            label: "Estado",
            render: (value: boolean) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs ${
                        value
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                    }`}
                >
                    {value ? "Activa" : "Archivada"}
                </span>
            ),
        },
    ];

    // 🔥 AQUÍ ESTABA TU ERROR PRINCIPAL
    const actions: Action[] = [
        {
            name: "edit",
            label: "Editar carrera",
            icon: <Pencil size={16} />,
            primary: true,
            variant: "default",
        },
        {
            name: "view",
            label: "Ver detalle",
            icon: <Eye size={16} />,
            variant: "default",
        },
        {
            name: "archive",
            label: "Archivar carrera",
            icon: <Archive size={16} />,
            variant: "danger",
        },
    ];

    return (
        <div>
            <PageHeader
                title="Carreras"
                subtitle="Gestiona las carreras del sistema"
                breadcrumb={["Inicio", "Carreras"]}
            />

            <TableToolbar
                searchPlaceholder="Buscar carrera..."
                onSearchChange={setSearch}
                onClear={() => setSearch("")}
                actionLabel="Nueva carrera"
                onAction={() => {
                    setSelected(null);
                    setModalOpen(true);
                }}
                filters={[]}
                filterValues={{}}
                onFilterChange={() => {}}
            />

            <GenericTable
                data={filteredData}
                columns={columns}
                actions={actions}
                onAction={handleAction}
            />

            <CareerFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selected}
            />
        </div>
    );
};

export default List;