import type { EnrollableStudent } from "./types";
import { getStudentName } from "./groupEnrollmentDisplay";

interface StudentEnrollmentSummaryProps {
    selectedStudent?: EnrollableStudent;
    selectedCredits: number;
    maxCredits: number;
}

export const StudentEnrollmentSummary = ({
    selectedStudent,
    selectedCredits,
    maxCredits,
}: StudentEnrollmentSummaryProps) => (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
        <div>
            <p className="text-xs uppercase text-gray-400">Estudiante</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
                {getStudentName(selectedStudent)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
                {selectedStudent?.student.identification ?? "Sin identificacion"}
            </p>
        </div>

        <div>
            <p className="text-xs uppercase text-gray-400">Matricula activa</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
                {selectedStudent?.activeRegistration
                    ? "Activa"
                    : "No encontrada"}
            </p>
            {selectedStudent?.activeRegistration && (
                <p className="mt-1 text-xs text-gray-500">
                    Carrera: {selectedStudent.activeRegistration.career_id}
                </p>
            )}
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Creditos seleccionados</p>
            <p className="mt-1 text-2xl font-bold text-primary">
                {selectedCredits} / {maxCredits}
            </p>
        </div>
    </aside>
);
