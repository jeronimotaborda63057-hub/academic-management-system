import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Archive } from "lucide-react";
import PageHeader          from "../../components/ui/PageHeader";
import TableToolbar        from "../../components/TableToolBar";
import GenericTable        from "../../components/ui/GenericTable";
import ArchiveSubjectModal from "../../components/modals/ArchiveSubjectModal";
import { subjectService }  from "../../services/subjectService";
import { groupService }    from "../../services/groupService";
import { curriculumService } from "../../services/curriculumService";
import type { Subject }    from "../../models/Subject";
import type { Action }     from "../../models/Action";
import Swal                from "sweetalert2";

const List: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData]               = useState<Subject[]>([]);
    const [search, setSearch]           = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [selected, setSelected]       = useState<Subject | null>(null);

    const fetchData = async () => {
        const subjects = await subjectService.getAll();
        setData(subjects ?? []);
    };

    useEffect(() => { fetchData(); }, []);

    // Opciones de créditos generadas dinámicamente desde los datos cargados
    const creditOptions = [
        ...[...new Set(data.map((s) => s.credits))]
            .sort((a, b) => a - b)
            .map((c) => ({ label: String(c), value: String(c) })),
    ];

    const filters = [
        {
            key: "is_active",
            label: "Estado",
            options: [
                { label: "Activa",     value: "true"   },
                { label: "Archivada",  value: "false"  },
            ],
        },
        {
            key: "credits",
            label: "Créditos",
            options: creditOptions,
        },
    ];

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
    };

    const verifyCanArchive = async (subject: Subject): Promise<boolean> => {

        // 1. Verificar grupos activos
        const groups = await groupService.search({ subject_id: subject.id });

        if (groups.length > 0) {
            await Swal.fire({
                icon:  "error",
                title: "No se puede archivar",
                html:  `<b>${subject.name}</b> tiene <b>${groups.length}</b> grupo(s) activo(s).<br/>
                        Finaliza los grupos antes de archivar la asignatura.`,
                confirmButtonText: "Entendido",
            });
            return false;
        }

        const allPlans = await curriculumService.getAll();

        for (const plan of allPlans) {
            if (!plan.id) continue;
            const planSubjects = await curriculumService.getSubjects(plan.id);
            const linked = planSubjects.some((s) => s.id === subject.id);

            if (linked) {
                await Swal.fire({
                    icon:  "error",
                    title: "No se puede archivar",
                    html:  `<b>${subject.name}</b> está vinculada al plan de estudios <b>${plan.name ?? plan.id}</b>.<br/>
                            Desvincula la asignatura del plan antes de archivarla.`,
                    confirmButtonText: "Entendido",
                });
                return false;
            }
        }

        return true;
    };

    const handleAction = async (action: string, item: Subject) => {
        switch (action) {
            case "edit":
                navigate(`/subjects/edit/${item.id}`);
                break;

            case "archive": {
                const canArchive = await verifyCanArchive(item);
                if (!canArchive) return;

                setSelected(item);
                setArchiveOpen(true);
                break;
            }
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

    const filteredData = data
        .filter(
            (s) =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.code.toLowerCase().includes(search.toLowerCase())
        )
        .filter((s) => {
            const val = filterValues["is_active"];
            if (!val) return true;
            return String(s.is_active) === val;
        })
        .filter((s) => {
            const val = filterValues["credits"];
            if (!val) return true;
            return String(s.credits) === val;
        });

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
        { name: "archive", label: "Archivar asignatura", icon: <Archive size={16} />, variant: "danger"  },
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
                onAction={() => navigate("/subjects/create")}
                filters={filters}
                filterValues={filterValues}
                onFilterChange={handleFilterChange}
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