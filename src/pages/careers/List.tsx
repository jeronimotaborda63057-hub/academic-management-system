import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/ui/GenericTable";
import { careerService } from "../../services/careerService";
import { semesterService } from "../../services/semesterService";
import type { Career } from "../../models/Career";
import type { Semester } from "../../models/Semester";
import type { Action } from "../../models/Action";
import { Pencil, Archive, Eye } from "lucide-react";
import Swal from "sweetalert2";
import ArchiveCareerModal from "../../components/modals/ArchiveCareerModal";

const List: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData]               = useState<Career[]>([]);
    const [search, setSearch]           = useState("");
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [selected, setSelected]       = useState<Career | null>(null);
    const [activeSemesters, setActiveSemesters] = useState<Semester[]>([]);

    const fetchData = async () => {
        const careers = await careerService.getAll();
        setData(careers ?? []);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAction = async (action: string, item: Career) => {
        switch (action) {
            case "edit":
                navigate(`/careers/edit/${item.id}`); // ✅ navega a página
                break;
            case "archive":
                const semesters = await semesterService.getByCareer(item.id);
                const active = semesters.filter((s) => s.is_active);
                setActiveSemesters(active);
                setSelected(item);
                setArchiveOpen(true);
                break;
            case "view":
                navigate(`/careers/detail/${item.id}`);
                break;
        }
    };

    const handleConfirmArchive = async () => {
        if (!selected || activeSemesters.length > 0) return;
        const res = await careerService.archive(selected.id);
        if (res) {
            Swal.fire("Archivada", "Carrera archivada correctamente.", "success");
            fetchData();
        }
        setArchiveOpen(false);
        setSelected(null);
    };

    const filteredData = data.filter(
        (c) =>
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    value ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                }`}>
                    {value ? "Activa" : "Archivada"}
                </span>
            ),
        },
    ];

    const actions: Action[] = [
        { name: "edit",    label: "Editar carrera",  icon: <Pencil size={16} />,  primary: true, variant: "default" },
        { name: "view",    label: "Ver detalle",      icon: <Eye size={16} />,     variant: "default" },
        { name: "archive", label: "Archivar carrera", icon: <Archive size={16} />, variant: "danger" },
    ];

    return (
        <div>
            <PageHeader
                title="Carreras"
                subtitle="Gestiona las carreras del sistema."
                breadcrumb={["Inicio", "Carreras"]}
            />
            <TableToolbar
                searchPlaceholder="Buscar carrera por nombre o código..."
                onSearchChange={setSearch}
                onClear={() => setSearch("")}
                actionLabel="Nueva carrera"
                onAction={() => navigate("/careers/create")}
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
            <ArchiveCareerModal
                isOpen={archiveOpen}
                onClose={() => { setArchiveOpen(false); setSelected(null); }}
                onConfirm={handleConfirmArchive}
                careerName={selected?.name ?? ""}
                careerCode={selected?.code ?? ""}
                activeSemesters={activeSemesters}
            />
        </div>
    );
};

export default List;