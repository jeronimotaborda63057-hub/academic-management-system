import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import TableToolbar from "../../components/TableToolBar";

import { studentService } from "../../services/studentService";

import type { Student } from "../../models/uml/Student";

const List: React.FC = () => {
    const navigate = useNavigate();

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

    /* 🔥 LÓGICA DE DETALLE (igual patrón TeachersList) */
    const handleViewDetail = (student: Student) => {
        if (!student?.id) return;

        navigate(`/admin/students/${student.id}`);
    };

    return (
        <div>
            <PageHeader
                title="Estudiantes"
                subtitle="Consulta los estudiantes del sistema."
                breadcrumb={["Inicio", "Administracion", "Estudiantes"]}
            />

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-900">
                        Listado de estudiantes
                    </h2>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {data.length} registros
                    </span>
                </div>

                <div className="px-5 py-4 border-b border-gray-100">
                    <TableToolbar
                        searchPlaceholder="Buscar por nombre o identificación..."
                        onSearchChange={setSearch}
                        onClear={() => setSearch("")}
                        filters={[]}
                        filterValues={{}}
                        onFilterChange={() => {}}
                    />
                </div>

                {filteredData.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-500">
                        No hay estudiantes registrados.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-5 py-3 text-left">
                                        Identificación
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Nombre
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Usuario ID
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Registrado
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredData.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="border-t border-gray-100"
                                    >
                                        <td className="px-5 py-4 text-gray-700">
                                            {student.identification}
                                        </td>

                                        <td className="px-5 py-4 font-medium text-gray-900">
                                            {student.first_name}{" "}
                                            {student.last_name}
                                        </td>

                                        <td className="px-5 py-4 text-gray-600 font-mono text-xs">
                                            {student.user_id ?? "—"}
                                        </td>

                                        <td className="px-5 py-4 text-gray-500 text-xs">
                                            {formatDate(student.created_at)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewDetail(student)
                                                }
                                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                            >
                                                <Eye size={16} />
                                                Ver detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default List;

/* ── utils ─────────────────────────────────────────────── */

const formatDate = (iso?: string): string => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};