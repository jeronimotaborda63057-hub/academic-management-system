import React, { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";

import Pagination from "../../components/common/Pagination";
import PageHeader from "../../components/ui/PageHeader";
import type { TeacherProfile } from "../../models/TeacherProfile";
import type { User } from "../../models/User";
import { userService } from "../../services/userService";

const ITEMS_PER_PAGE = 10;

const isTeacher = (user: User): boolean => {
    const role = user.role.toLowerCase();
    return role === "teacher" || role === "docente";
};

const getTeacherProfile = (user: User): TeacherProfile | undefined => {
    const profile = user.profile;
    if (!profile || !("first_name" in profile) || !("last_name" in profile)) return undefined;
    return profile as TeacherProfile;
};

const getTeacherName = (user: User): string => {
    const profile = getTeacherProfile(user);
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
    return fullName || user.code || user.email;
};

const getTeacherDepartment = (user: User): string => {
    const profile = getTeacherProfile(user);
    return profile?.specialty || "Sin departamento";
};

const TeachersList: React.FC = () => {
    const [teachers, setTeachers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTeachers = async () => {
            try {
                setLoading(true);
                setError(null);

                const users = await userService.getAll();
                setTeachers(users.filter(isTeacher));
            } catch {
                setError("No fue posible cargar los docentes.");
            } finally {
                setLoading(false);
            }
        };

        loadTeachers();
    }, []);

    const paginatedTeachers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return teachers.slice(start, start + ITEMS_PER_PAGE);
    }, [currentPage, teachers]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(teachers.length / ITEMS_PER_PAGE));
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, teachers.length]);

    return (
        <div>
            <PageHeader
                title="Docentes"
                subtitle="Consulta los usuarios registrados con rol docente."
                breadcrumb={["Inicio", "Administracion", "Docentes"]}
            />

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-900">Listado de docentes</h2>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {teachers.length} registros
                    </span>
                </div>

                {loading ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-500">
                        Cargando docentes...
                    </div>
                ) : error ? (
                    <div className="px-5 py-10 text-center text-sm text-red-600">
                        {error}
                    </div>
                ) : teachers.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-500">
                        No hay docentes registrados.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Nombre</th>
                                        <th className="px-5 py-3 text-left">Email</th>
                                        <th className="px-5 py-3 text-left">Departamento</th>
                                        <th className="px-5 py-3 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTeachers.map((teacher) => (
                                        <tr key={teacher.id} className="border-t border-gray-100">
                                            <td className="px-5 py-4 font-medium text-gray-900">
                                                {getTeacherName(teacher)}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {teacher.email}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {getTeacherDepartment(teacher)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
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

                        <Pagination
                            currentPage={currentPage}
                            totalItems={teachers.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </section>
        </div>
    );
};

export default TeachersList;
