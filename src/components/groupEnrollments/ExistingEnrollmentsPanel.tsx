import type { ExistingEnrollmentRow } from "../../models/interfaces/ExistingEnrollmentRow";

interface ExistingEnrollmentsPanelProps {
    enrollments: ExistingEnrollmentRow[];
    onCancelEnrollment: (enrollmentId: string) => void;
}

export const ExistingEnrollmentsPanel = ({
    enrollments,
    onCancelEnrollment,
}: ExistingEnrollmentsPanelProps) => (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Inscripciones actuales</h2>

        {enrollments.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
                El estudiante no tiene inscripciones activas.
            </p>
        ) : (
            <div className="mt-4 space-y-3">
                {enrollments.map(({ enrollment, group, subject }) => (
                    <div
                        key={enrollment.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {subject?.name ?? group?.name ?? "Grupo"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {group?.group_code ?? ""} · {enrollment.status}
                            </p>
                        </div>
                        {enrollment.id && (
                            <button
                                type="button"
                                onClick={() => onCancelEnrollment(enrollment.id!)}
                                className="text-xs font-medium text-red-600 hover:underline"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
    </section>
);
