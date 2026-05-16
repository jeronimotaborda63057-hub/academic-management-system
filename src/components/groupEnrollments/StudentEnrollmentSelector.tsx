import type { EnrollableStudent } from "../../models/EnrollableStudent";
import { getStudentLabel } from "../../hooks/groupEnrollmentDisplay";

interface StudentEnrollmentSelectorProps {
    search: string;
    selectedStudentId: string;
    students: EnrollableStudent[];
    onSearchChange: (value: string) => void;
    onStudentChange: (studentId: string) => void;
}

export const StudentEnrollmentSelector = ({
    search,
    selectedStudentId,
    students,
    onSearchChange,
    onStudentChange,
}: StudentEnrollmentSelectorProps) => (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.2fr]">
            <div>
                <label className="text-xs font-semibold uppercase text-gray-400">
                    Buscar estudiante
                </label>
                <input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Nombre, apellido o cedula"
                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
                />
            </div>

            <div>
                <label className="text-xs font-semibold uppercase text-gray-400">
                    Estudiante
                </label>
                <select
                    value={selectedStudentId}
                    onChange={(event) => onStudentChange(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
                >
                    <option value="">Selecciona un estudiante</option>
                    {students.map((student) => (
                        <option key={student.student.id} value={student.student.id}>
                            {getStudentLabel(student)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    </section>
);
