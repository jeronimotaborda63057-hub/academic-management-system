import { useMemo } from "react";
import { Filter, Search } from "lucide-react";

import Pagination from "../common/Pagination";
import GenericTable from "../ui/GenericTable";
import type { Column } from "../../models/Column";
import type { StudentEnrollmentOption } from "../../hooks/useStudentEnrollment";
import { getStudentDisplayName } from "../../hooks/useStudentEnrollment";
import { formatActiveCareer } from "./enrollmentFormatters";
import { SectionCard } from "./SectionCard";
import { StatusBadge } from "./StatusBadge";

interface StudentsSearchSectionProps {
    currentPage: number;
    filteredStudents: StudentEnrollmentOption[];
    itemsPerPage: number;
    loading: boolean;
    onPageChange: (page: number) => void;
    onSearchChange: (value: string) => void;
    onSelectStudent: (student: StudentEnrollmentOption) => void;
    paginatedStudents: StudentEnrollmentOption[];
    search: string;
    selectedStudentId: string;
}

export const StudentsSearchSection = ({
    currentPage,
    filteredStudents,
    itemsPerPage,
    loading,
    onPageChange,
    onSearchChange,
    onSelectStudent,
    paginatedStudents,
    search,
    selectedStudentId,
}: StudentsSearchSectionProps) => {
    const columns = useMemo<Column<StudentEnrollmentOption>[]>(
        () => [
            {
                key: "selection",
                label: "",
                render: (_, row) => (
                    <input
                        type="radio"
                        checked={selectedStudentId === row.user.id}
                        onChange={() => onSelectStudent(row)}
                        className="h-4 w-4 accent-green-700"
                        aria-label={`Seleccionar ${getStudentDisplayName(row.user)}`}
                    />
                ),
            },
            {
                key: "student",
                label: "Estudiante",
                render: (_, row) => (
                    <span className="font-medium text-gray-900">
                        {getStudentDisplayName(row.user)}
                    </span>
                ),
            },
            {
                key: "identification",
                label: "Identificacion",
                render: (_, row) => (
                    <span className="text-gray-600">{row.profile.identification}</span>
                ),
            },
            {
                key: "career",
                label: "Carrera actual",
                render: (_, row) => <span>{formatActiveCareer(row)}</span>,
            },
            {
                key: "status",
                label: "Estado",
                render: (_, row) => (
                    <StatusBadge status={row.user.is_active ? "ACTIVE" : "INACTIVE"} />
                ),
            },
        ],
        [onSelectStudent, selectedStudentId]
    );

    return (
        <SectionCard>
            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Buscar estudiante
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Busca un estudiante activo en el sistema.
                </p>
            </div>

            <div className="mb-4 flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Buscar por nombre, apellido o cedula..."
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 pr-11 text-sm outline-none transition focus:border-green-700"
                    />
                </div>

                <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    title="Filtros"
                >
                    <Filter size={16} />
                    Filtros
                </button>
            </div>

            {loading ? (
                <div className="flex h-56 items-center justify-center text-sm text-gray-500">
                    Cargando estudiantes...
                </div>
            ) : paginatedStudents.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-sm text-gray-500">
                    No se encontraron estudiantes.
                </div>
            ) : (
                <>
                    <GenericTable<StudentEnrollmentOption>
                        data={paginatedStudents}
                        columns={columns}
                        getRowId={(option) => option.user.id}
                        onRowClick={onSelectStudent}
                        selectedRowId={selectedStudentId}
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredStudents.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={onPageChange}
                    />
                </>
            )}
        </SectionCard>
    );
};
