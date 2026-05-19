import type { AcademicRegistrationStatus } from "../../models/uml/Registration";
import { getAcademicStatusLabel } from "../../hooks/useStudentEnrollment";

interface SummaryBlockProps {
    admissionPeriod: string;
    careerName?: string;
    currentCareerName?: string;
    email?: string;
    identification?: string;
    status: AcademicRegistrationStatus;
    studentName: string;
}

export const SummaryBlock = ({
    admissionPeriod,
    careerName,
    currentCareerName,
    email,
    identification,
    status,
    studentName,
}: SummaryBlockProps) => {
    const rows = [
        ["Estudiante", studentName || "-"],
        ["Identificación", identification || "-"],
        ["Email", email || "-"],
        ["Carrera", careerName || "Sin carrera"],
        ["Periodo de ingreso", admissionPeriod || "Sin periodo de ingreso"],
        ["Estado academico", getAcademicStatusLabel(status)],
        ["Matricula activa", currentCareerName || "-"],
    ];

    return (
        <div>
            <p className="mb-3 text-sm font-semibold text-gray-900">Resumen</p>
            <dl className="space-y-3">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 text-sm"
                    >
                        <dt className="font-semibold text-gray-900">{label}:</dt>
                        <dd className="min-w-0 break-words text-gray-600">{value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};