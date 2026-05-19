import React from "react";
import { useParams } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import { getGroupSchedule } from "../../hooks/useTeacherGroups";
import { useTeacherDetail } from "../../hooks/useTeacherDetail";

const TeacherDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const {
        error,
        groups,
        loading,
        teacher,
        teacherName,
        teacherProfile,
    } = useTeacherDetail(id);

    return (
        <div>
            <PageHeader
                title={teacherName}
                subtitle="Detalle completo del perfil docente."
                breadcrumb={["Inicio", "Administracion", "Docentes", "Detalle"]}
            />

            {loading ? (
                <section className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                    Cargando docente...
                </section>
            ) : error ? (
                <section className="rounded-xl border border-red-100 bg-white p-8 text-center text-sm text-red-600">
                    {error}
                </section>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Perfil</h2>

                        <dl className="mt-5 flex flex-col divide-y divide-gray-100">
                            {[
                                ["Nombre", teacherName],
                                ["Email", teacher?.email ?? "-"],
                                ["Codigo", teacher?.code ?? "-"],
                                ["Identificacion", teacherProfile?.identification ?? "-"],
                                ["Telefono", teacherProfile?.phone ?? "-"],
                                ["Departamento", teacherProfile?.specialty ?? "Sin departamento"],
                                ["Estado", teacher?.is_active ? "Activo" : "Inactivo"],
                            ].map(([label, value]) => (
                                <div key={label} className="flex items-start justify-between gap-4 py-3">
                                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        {label}
                                    </dt>
                                    <dd className="text-right text-sm font-medium text-gray-900">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-900">Grupos asignados</h2>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                {groups.length} registros
                            </span>
                        </div>

                        {groups.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-gray-500">
                                Este docente no tiene grupos asignados.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                                        <tr>
                                            <th className="px-5 py-3 text-left">Grupo</th>
                                            <th className="px-5 py-3 text-left">Materia</th>
                                            <th className="px-5 py-3 text-left">Semestre</th>
                                            <th className="px-5 py-3 text-left">Horario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groups.map((group) => (
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
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default TeacherDetail;
