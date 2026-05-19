import type {
    AcademicRegistrationStatus,
    Registration,
} from "../../models/uml/Registration";
import { ACADEMIC_STATUS_OPTIONS } from "../../hooks/useStudentEnrollment";
import { fieldClassName, FormField, SelectShell } from "./FormControls";
import { ModalShell } from "./ModalShell";

interface UpdateStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    registrations: Registration[];
    selectedRegistrationId: string;
    selectedStatus: AcademicRegistrationStatus;
    setRegistrationId: (registrationId: string) => void;
    setStatus: (status: AcademicRegistrationStatus) => void;
    submitting: boolean;
}

export const UpdateStatusModal = ({
    isOpen,
    onClose,
    onConfirm,
    registrations,
    selectedRegistrationId,
    selectedStatus,
    setRegistrationId,
    setStatus,
    submitting,
}: UpdateStatusModalProps) => {
    if (!isOpen) return null;

    return (
        <ModalShell title="Actualizar estado academico" onClose={onClose}>
            <p className="mb-5 text-sm text-gray-500">
                Actualiza el estado academico de una matricula existente.
            </p>

            <div className="space-y-4">
                <FormField label="Carrera" required>
                    <SelectShell>
                        <select
                            value={selectedRegistrationId}
                            onChange={(event) => setRegistrationId(event.target.value)}
                            className={fieldClassName(false)}
                        >
                            <option value="">Seleccione una carrera</option>
                            {registrations.map((registration) => (
                                <option key={registration.id} value={registration.id}>
                                    {registration.career?.name ?? registration.career_id}
                                </option>
                            ))}
                        </select>
                    </SelectShell>
                </FormField>

                <FormField label="Estado academico" required>
                    <SelectShell>
                        <select
                            value={selectedStatus}
                            onChange={(event) =>
                                setStatus(event.target.value as AcademicRegistrationStatus)
                            }
                            className={fieldClassName(false)}
                        >
                            {ACADEMIC_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </SelectShell>
                </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="h-10 rounded-lg border border-gray-200 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={submitting}
                    className="h-10 rounded-lg bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {submitting ? "Actualizando..." : "Actualizar"}
                </button>
            </div>
        </ModalShell>
    );
};
