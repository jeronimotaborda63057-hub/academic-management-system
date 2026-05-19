import React from "react";
import { useParams } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import { useStudentDetail } from "../../hooks/useStudentDetail";

const StudentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { enrollments, error, loading, student, studentName } =
        useStudentDetail(id);

    const activeEnrollments = enrollments.filter(
        (e) => e.status === "ACTIVE" || (!e.status && e.group_id)
    );
    const inactiveEnrollments = enrollments.filter(
        (e) => e.status && e.status !== "ACTIVE"
    );

    return (
        <div>
            <PageHeader
                title={studentName}
                subtitle="Detalle completo del perfil del estudiante."
                breadcrumb={["Inicio", "Administracion", "Estudiantes", "Detalle"]}
            />

            {loading ? (
                <section className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                    Cargando estudiante...
                </section>
            ) : error ? (
                <section className="rounded-xl border border-red-100 bg-white p-8 text-center text-sm text-red-600">
                    {error}
                </section>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                    {/* ── PERFIL ─────────────────────────────────────────────── */}
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Perfil</h2>

                        <dl className="mt-5 flex flex-col divide-y divide-gray-100">
                            {[
                                ["Nombre", studentName],
                                ["Identificación", student?.identification ?? "-"],
                                ["Usuario ID", student?.user_id ?? "-"],
                                [
                                    "Registrado",
                                    student?.created_at
                                        ? new Date(student.created_at).toLocaleDateString(
                                              "es-CO",
                                              {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric",
                                              }
                                          )
                                        : "-",
                                ],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex items-start justify-between gap-4 py-3"
                                >
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

                    {/* ── GRUPOS INSCRITOS ───────────────────────────────────── */}
                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Grupos inscritos
                            </h2>
                            <div className="flex items-center gap-2">
                                {activeEnrollments.length > 0 && (
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                        {activeEnrollments.length} activos
                                    </span>
                                )}
                                {inactiveEnrollments.length > 0 && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                        {inactiveEnrollments.length} inactivos
                                    </span>
                                )}
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                    {enrollments.length} total
                                </span>
                            </div>
                        </div>

                        {enrollments.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-gray-500">
                                Este estudiante no tiene grupos inscritos.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                                        <tr>
                                            <th className="px-5 py-3 text-left">Grupo</th>
                                            <th className="px-5 py-3 text-left">Asignatura</th>
                                            <th className="px-5 py-3 text-left">Semestre</th>
                                            <th className="px-5 py-3 text-left">Estado</th>
                                            <th className="px-5 py-3 text-left">Fecha inscripción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map((enrollment) => (
                                            <tr
                                                key={enrollment.id}
                                                className="border-t border-gray-100"
                                            >
                                                <td className="px-5 py-4 font-medium text-gray-900">
                                                    {enrollment.group?.name ??
                                                        (enrollment.group as any)?.group_code ??
                                                        enrollment.group_id ??
                                                        "Grupo sin nombre"}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">
                                                    {(enrollment.group as any)?.subject?.name ??
                                                        "Asignatura no asignada"}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">
                                                    {(enrollment.group as any)?.semester?.name ??
                                                        "Semestre no asignado"}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge status={enrollment.status} />
                                                </td>
                                                <td className="px-5 py-4 text-gray-500 text-xs">
                                                    {enrollment.enrollment_date
                                                        ? new Date(
                                                              enrollment.enrollment_date
                                                          ).toLocaleDateString("es-CO", {
                                                              year: "numeric",
                                                              month: "short",
                                                              day: "numeric",
                                                          })
                                                        : "—"}
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

/* ── Sub-componente de estado ───────────────────────────────────────────────── */

const statusMap: Record<string, { label: string; className: string }> = {
    ACTIVE: {
        label: "Activo",
        className: "bg-green-100 text-green-700",
    },
    INACTIVE: {
        label: "Inactivo",
        className: "bg-gray-100 text-gray-600",
    },
    WITHDRAWN: {
        label: "Retirado",
        className: "bg-red-100 text-red-600",
    },
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
    const entry = status ? statusMap[status] : undefined;
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                entry?.className ?? "bg-gray-100 text-gray-600"
            }`}
        >
            {entry?.label ?? status ?? "Desconocido"}
        </span>
    );
};

export default StudentDetail;