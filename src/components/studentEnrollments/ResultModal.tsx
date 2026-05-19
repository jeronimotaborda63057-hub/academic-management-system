import { CheckCircle2, XCircle } from "lucide-react";

import type { Registration } from "../../models/uml/Registration";
import { getAcademicStatusLabel } from "../../hooks/useStudentEnrollment";
import type { ResultModalState } from "../../models/interfaces/States";
import { DetailRow } from "./DetailRow";
import { formatDateTime } from "../../hooks/enrollmentFormatters";
import { ModalShell } from "./ModalShell";

interface ResultModalProps {
    activeDuplicate?: Registration;
    careerName?: string;
    isOpen: boolean;
    onClose: () => void;
    result: ResultModalState;
    studentName: string;
}

export const ResultModal = ({
    activeDuplicate,
    careerName,
    isOpen,
    onClose,
    result,
    studentName,
}: ResultModalProps) => {
    if (!isOpen || !result) return null;

    const isSuccess = result.type === "success";
    const registration = result.registration ?? activeDuplicate;

    return (
        <ModalShell
            title={isSuccess ? "Exito" : "No se puede matricular"}
            onClose={onClose}
        >
            <div className="flex flex-col items-center text-center">
                <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full border-4 ${isSuccess
                        ? "border-green-700 text-green-700"
                        : "border-red-700 text-red-700"
                        }`}
                >
                    {isSuccess ? <CheckCircle2 size={34} /> : <XCircle size={34} />}
                </div>

                <h3 className="text-base font-semibold text-gray-900">
                    {isSuccess
                        ? "Matricula creada exitosamente"
                        : "No se puede matricular al estudiante"}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    {isSuccess
                        ? `El estudiante ha sido matriculado en la carrera ${careerName ?? "-"}.`
                        : `${studentName} ya tiene una matricula activa en la carrera ${careerName ?? "-"}.`}
                </p>
            </div>

            <div
                className={`mt-5 rounded-lg border p-4 ${isSuccess
                    ? "border-green-100 bg-green-50"
                    : "border-red-100 bg-red-50"
                    }`}
            >
                <p className="mb-3 text-sm font-semibold text-gray-900">
                    {isSuccess ? "Datos de la matricula" : "Matricula activa encontrada"}
                </p>
                <dl className="space-y-2 text-sm">
                    <DetailRow label="ID de matricula" value={registration?.id ?? "-"} />
                    <DetailRow
                        label={isSuccess ? "Fecha de creacion" : "Periodo de ingreso"}
                        value={
                            isSuccess
                                ? formatDateTime(registration?.created_at)
                                : registration?.admission_period ?? "-"
                        }
                    />
                    <DetailRow
                        label="Estado academico"
                        value={getAcademicStatusLabel(registration?.academic_status)}
                    />
                </dl>
            </div>

            <div className="mt-5 flex justify-center">
                <button
                    type="button"
                    onClick={onClose}
                    className="h-10 rounded-lg border border-gray-200 px-8 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    {isSuccess ? "Cerrar" : "Entendido"}
                </button>
            </div>
        </ModalShell>
    );
};
