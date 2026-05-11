import React, { useEffect, useState } from "react";
import GenericTable from "../../components/GenericTable";
import type { Action } from "../../models/Action";
import PageHeader from "../../components/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import { SemesterService } from "../../services/semesterService";
import type { Semester } from "../../models/Semester";
import { Pencil, Eye, CheckCircle, XCircle } from "lucide-react";
import Swal from "sweetalert2";

const semesterService = new SemesterService();

const List: React.FC = () => {
    const [data, setData] = useState<Semester[]>([]);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        const res = await semesterService.getAll();
        setData(res ?? []);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 🔥 acciones
    const handleAction = async (action: string, item: Semester) => {
        switch (action) {
            case "edit":
                console.log("Editar:", item);
                break;

            case "view":
                console.log("Ver:", item);
                break;

            case "activate":
                await activateSemester(item.id);
                break;

            case "close":
                await closeSemester(item.id);
                break;
        }
    };

    // ✅ activar semestre
    const activateSemester = async (id: string) => {
        const result = await Swal.fire({
            title: "¿Activar semestre?",
            text: "Se desactivarán los demás semestres",
            icon: "warning",
            showCancelButton: true,
        });

        if (result.isConfirmed) {
            const res = await semesterService.setActive(id);

            if (res) {
                Swal.fire("Activado", "Semestre activo", "success");
                fetchData();
            }
        }
    };

    // ✅ cerrar semestre
    const closeSemester = async (id: string) => {
        const result = await Swal.fire({
            title: "¿Cerrar semestre?",
            text: "El semestre dejará de estar activo",
            icon: "warning",
            showCancelButton: true,
        });

        if (result.isConfirmed) {
            const res = await semesterService.close(id);

            if (res) {
                Swal.fire("Cerrado", "Semestre cerrado", "success");
                fetchData();
            }
        }
    };

    // 🔎 filtro
    const filteredData = (data ?? []).filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    // 📊 columnas
    const columns = [
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre" },
        {
            key: "start_date",
            label: "Inicio",
        },
        {
            key: "end_date",
            label: "Fin",
        },
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
                    {value ? "Activo" : "Cerrado"}
                </span>
            ),
        },
    ];

    // ⚡ acciones tipadas correctamente
    const actions: Action[] = [
        {
            name: "edit",
            label: "Editar",
            icon: <Pencil size={16} />,
            primary: true,
            variant: "default",
        },
        {
            name: "view",
            label: "Ver",
            icon: <Eye size={16} />,
            variant: "default",
        },
        {
            name: "activate",
            label: "Activar",
            icon: <CheckCircle size={16} />,
            variant: "default",
        },
        {
            name: "close",
            label: "Cerrar",
            icon: <XCircle size={16} />,
            variant: "danger",
        },
    ];

    return (
        <div>
            <PageHeader
                title="Semestres"
                subtitle="Gestiona los semestres académicos"
                breadcrumb={["Inicio", "Semestres"]}
            />

            <TableToolbar
                searchPlaceholder="Buscar semestre..."
                onSearchChange={setSearch}
                onClear={() => setSearch("")}
                actionLabel="Nuevo semestre"
                onAction={() => {
                    console.log("Abrir modal crear semestre");
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
        </div>
    );
};

export default List;