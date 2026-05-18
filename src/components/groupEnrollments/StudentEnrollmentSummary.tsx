import type { EnrollableStudent } from "../../models/EnrollableStudent";
import { getStudentName } from "../../hooks/groupEnrollmentDisplay";

interface StudentEnrollmentSummaryProps {
    selectedStudent?: EnrollableStudent;
    selectedCredits: number;
    maxCredits: number;
}

export const StudentEnrollmentSummary = ({
    selectedStudent,
    selectedCredits,
    maxCredits,
}: StudentEnrollmentSummaryProps) => {
    const registration = selectedStudent?.activeRegistration;

    return (
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

                {registration ? (
                    <div className="mt-1 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Carrera</span>
                            <span className="font-medium text-gray-900">
                                {registration.career_id}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Periodo de ingreso</span>
                            <span className="font-medium text-gray-900">
                                {registration.admission_period ?? "—"}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Estado académico</span>
                            <span className="font-medium text-gray-900">
                                {registration.academic_status ?? "—"}
                            </span>
                        </div>
                    </div>
                ) : (
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                        No encontrada
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
};