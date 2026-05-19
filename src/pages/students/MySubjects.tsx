import React from "react";

import PageHeader from "../../components/ui/PageHeader";
import { useStudentSubjects } from "../../hooks/useStudentSubjects";

const MySubjects: React.FC = () => {
    const { error, loading, subjects } = useStudentSubjects();

    return (
        <div>
            <PageHeader
                title="Mis asignaturas"
                subtitle="Consulta las asignaturas asociadas a tus matriculas actuales."
                breadcrumb={["Inicio", "Estudiante", "Mis asignaturas"]}
            />

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-900">Asignaturas inscritas</h2>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {subjects.length} registros
                    </span>
                </div>

                {loading ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-500">
                        Cargando asignaturas...
                    </div>
                ) : error ? (
                    <div className="px-5 py-10 text-center text-sm text-red-600">
                        {error}
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-500">
                        No tienes asignaturas registradas.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-5 py-3 text-left">Codigo</th>
                                    <th className="px-5 py-3 text-left">Asignatura</th>
                                    <th className="px-5 py-3 text-left">Creditos</th>
                                    <th className="px-5 py-3 text-left">Grupo</th>
                                    <th className="px-5 py-3 text-left">Semestre</th>
                                    <th className="px-5 py-3 text-left">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((subject) => (
                                    <tr key={subject.id} className="border-t border-gray-100">
                                        <td className="px-5 py-4 font-semibold text-gray-600">
                                            {subject.code}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-gray-900">
                                            {subject.name}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {subject.credits}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {subject.groupName}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {subject.semesterName}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {subject.status}
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

export default MySubjects;