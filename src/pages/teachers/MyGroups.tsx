import React from "react";

import Pagination from "../../components/common/Pagination";
import PageHeader from "../../components/ui/PageHeader";
import { getGroupSchedule, useTeacherGroups } from "../../hooks/useTeacherGroups";

const MyGroups: React.FC = () => {
    const {
        currentPage,
        error,
        groups,
        itemsPerPage,
        loading,
        paginatedGroups,
        setCurrentPage,
    } = useTeacherGroups();

    return (
        <div>
            <PageHeader
                title="Mis grupos"
                subtitle="Consulta los grupos asignados actualmente."
                breadcrumb={["Inicio", "Docente", "Mis grupos"]}
            />

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-900">Grupos asignados</h2>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {groups.length} registros
                    </span>
                </div>

                {loading ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-500">
                        Cargando grupos...
                    </div>
                ) : error ? (
                    <div className="px-5 py-10 text-center text-sm text-red-600">
                        {error}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-500">
                        No tienes grupos asignados.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Nombre del Grupo</th>
                                        <th className="px-5 py-3 text-left">Materia</th>
                                        <th className="px-5 py-3 text-left">Semestre</th>
                                        <th className="px-5 py-3 text-left">Horario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedGroups.map((group) => (
                                        <tr key={group.id} className="border-t border-gray-100">
                                            <td className="px-5 py-4 font-medium text-gray-900">
                                                {group.name ?? group.group_code ?? "Grupo sin nombre"}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {group.subject?.name ?? "Materia no asignada"}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {group.semester?.name ?? "Semestre no asignado"}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {getGroupSchedule(group)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={groups.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </section>
        </div>
    );
};

export default MyGroups;
