import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Archive } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/common/GenericTable";
import ArchiveSubjectModal from "../../components/ArchiveSubjectModal";
import { subjectService } from "../../services/subjectService";
import type { Subject } from "../../models/Subject";
import type { Action } from "../../models/Action";
import Swal from "sweetalert2";

const List: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData]               = useState<Subject[]>([]);
    const [search, setSearch]           = useState("");
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [selected, setSelected]       = useState<Subject | null>(null);

    const fetchData = async () => {
        const subjects = await subjectService.getAll();
        setData(subjects ?? []);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAction = (action: string, item: Subject) => {
        switch (action) {
            case "edit":
                // ✅ navega a página igual que users/careers
                navigate(`/subjects/edit/${item.id}`);
                break;
            case "archive":
                setSelected(item);
                setArchiveOpen(true);
                break;
        }
    };

    const handleConfirmArchive = async () => {
        if (!selected?.id) return;
        const res = await subjectService.archive(selected.id);
        if (res) {
            Swal.fire("Archivada", "Asignatura archivada correctamente.", "success");
            fetchData();
        } else {
            Swal.fire("Error", "No se pudo archivar la asignatura.", "error");
        }
        setArchiveOpen(false);
        setSelected(null);
    };

    const filteredData = data.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.code.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { key: "code",        label: "Código"      },
        { key: "name",        label: "Nombre"      },
        { key: "credits",     label: "Créditos"    },
        { key: "description", label: "Descripción" },
        {
            key: "is_active",
            label: "Estado",
            render: (value: boolean) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    value
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                }`}>
                    {value ? "Activa" : "Archivada"}
                </span>
            ),
        },
    ];

    const actions: Action[] = [
        { name: "edit",    label: "Editar asignatura",   icon: <Pencil size={16} />,  primary: true, variant: "default" },
        { name: "archive", label: "Archivar asignatura",  icon: <Archive size={16} />, variant: "danger"  },
    ];

    return (
        <div>
            <PageHeader
                title="Asignaturas"
                subtitle="Gestiona el catálogo de asignaturas del sistema."
                breadcrumb={["Inicio", "Asignaturas"]}
            />
            <TableToolbar
                searchPlaceholder="Buscar asignatura por nombre o código..."
                onSearchChange={setSearch}
                onClear={() => setSearch("")}
                actionLabel="Nueva asignatura"
                onAction={() => navigate("/subjects/create")} // ✅ navega a página
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
            <ArchiveSubjectModal
                isOpen={archiveOpen}
                onClose={() => { setArchiveOpen(false); setSelected(null); }}
                onConfirm={handleConfirmArchive}
                subjectName={selected?.name ?? ""}
                subjectCode={selected?.code ?? ""}
            />
        </div>
    );
};

export default List;