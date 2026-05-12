import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import TableToolbar from "../../components/TableToolBar";
import GenericTable from "../../components/GenericTable";
import { semesterService } from "../../services/semesterService";
import { careerService } from "../../services/careerService";
import type { Semester, SemesterForm } from "../../models/Semester";
import type { Career } from "../../models/Career";
import type { Action } from "../../models/Action";
import { Pencil, Eye } from "lucide-react";
import Swal from "sweetalert2";
import SemesterFormModal from "../../components/SemesterFormModal";
import { useNavigate } from "react-router-dom";

const List: React.FC = () => {
    const [data, setData]         = useState<Semester[]>([]);
    const [careers, setCareers]   = useState<Career[]>([]);
    const [search, setSearch]     = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState<Semester | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const fetchData = async () => {
        const [semesters, careerList] = await Promise.all([
            semesterService.getAll(),
            careerService.getAll(),
        ]);
        setData(semesters ?? []);
        setCareers(careerList ?? []);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAction = (action: string, item: Semester) => {
    if (action === "edit") navigate(`/semesters/edit/${item.id}`); // ✅
};

    const handleSubmit = async (form: SemesterForm) => {
        setIsLoading(true);
        try {
            if (selected) {
                await semesterService.update(selected.id, form);
                Swal.fire("Éxito", "Semestre actualizado correctamente.", "success");
            } else {
                await semesterService.create(form);
                Swal.fire("Éxito", "Semestre creado correctamente.", "success");
            }
            setModalOpen(false);
            setSelected(null);
            fetchData();
        } catch {
            Swal.fire("Error", "Ocurrió un error al guardar el semestre.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const getCareerName = (careerId: string) =>
        careers.find((c) => c.id === careerId)?.name ?? "-";

    const filteredData = data.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.code.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre" },
        {
            key: "career_id",
            label: "Carrera",
            render: (value: string) => <span>{getCareerName(value)}</span>,
        },
        {
            key: "start_date",
            label: "Fecha inicio",
            render: (value: string) => (
                <span>{new Date(value).toLocaleDateString("es-CO")}</span>
            ),
        },
        {
            key: "end_date",
            label: "Fecha fin",
            render: (value: string) => (
                <span>{new Date(value).toLocaleDateString("es-CO")}</span>
            ),
        },
        {
            key: "is_active",
            label: "Estado",
            render: (value: boolean) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    value
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                }`}>
                    {value ? "Activo" : "Inactivo"}
                </span>
            ),
        },
    ];

    const actions: Action[] = [
        { name: "edit", label: "Editar semestre", icon: <Pencil size={16} />, primary: true, variant: "default" },
        { name: "view", label: "Ver detalle",      icon: <Eye size={16} />,    variant: "default" },
    ];

    return (
        <div>
            <PageHeader
                title="Semestres"
                subtitle="Gestiona los semestres académicos del sistema."
                breadcrumb={["Inicio", "Semestres"]}
            />
            <TableToolbar
                searchPlaceholder="Buscar semestre por nombre o código..."
                onSearchChange={setSearch}
                onClear={() => setSearch("")}
                actionLabel="Nuevo semestre"
                onAction={() => navigate("/semesters/create")}
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

            <SemesterFormModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setSelected(null); }}
                onSubmit={handleSubmit}
                initialData={selected}
                careers={careers}
                isLoading={isLoading}
            />
        </div>
    );
};

export default List;