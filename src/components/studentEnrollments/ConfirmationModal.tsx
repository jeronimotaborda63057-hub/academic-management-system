import type { AcademicRegistrationStatus } from "../../models/uml/Registration";
import { getAcademicStatusLabel } from "../../hooks/useStudentEnrollment";
import { InfoBanner } from "./InfoBanner";
import { ModalShell } from "./ModalShell";

interface ConfirmationModalProps {
    admissionPeriod: string;
    careerName?: string;
    identification?: string;
    isOpen: boolean;
    onBack: () => void;
    onConfirm: () => void;
    status: AcademicRegistrationStatus;
    studentName: string;
    submitting: boolean;
}

export const ConfirmationModal = ({
    admissionPeriod,
    careerName,
    identification,
    isOpen,
    onBack,
    onConfirm,
    status,
    studentName,
    submitting,
}: ConfirmationModalProps) => {
    if (!isOpen) return null;

    const rows = [
        ["Estudiante", studentName],
        ["Identificacion", identification ?? "-"],
        ["Carrera", careerName ?? "-"],
        ["Periodo de ingreso", admissionPeriod],
        ["Estado academico inicial", getAcademicStatusLabel(status)],
    ];

    return (
        <ModalShell title="Confirmar matricula" onClose={onBack}>
            <InfoBanner tone="info" title="Verifica la informacion">
                Revisa los datos antes de confirmar.
            </InfoBanner>

            <dl className="mt-5 space-y-3">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="grid grid-cols-[150px_minmax(0,1fr)] gap-3 text-sm"
                    >
                        <dt className="font-semibold text-gray-900">{label}:</dt>
                        <dd className="text-gray-600">{value}</dd>
                    </div>
                ))}
            </dl>

            <InfoBanner tone="warning" title="Creacion de registro">
                Una vez confirmada, se creara el registro de matricula y se notificara
                al estudiante.
            </InfoBanner>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="h-10 rounded-lg border border-gray-200 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    Atras
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={submitting}
                    className="h-10 rounded-lg bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {submitting ? "Confirmando..." : "Confirmar matricula"}
                </button>
            </div>
        </ModalShell>
    );
};
