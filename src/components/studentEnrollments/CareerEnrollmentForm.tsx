import type { Dispatch, SetStateAction } from "react";

import type { Career } from "../../models/uml/Career";
import type { AcademicRegistrationStatus } from "../../models/uml/Registration";
import {
    ACADEMIC_STATUS_OPTIONS,
    type StudentEnrollmentDraft,
    type StudentEnrollmentErrors,
} from "../../hooks/useStudentEnrollment";
import { fieldClassName, FormField, SelectShell } from "./FormControls";
import { InfoBanner } from "./InfoBanner";
import { SectionCard } from "./SectionCard";

interface CareerEnrollmentFormProps {
    canSubmit: boolean;
    careers: Career[];
    draft: StudentEnrollmentDraft;
    errors: StudentEnrollmentErrors;
    hasRegistrations: boolean;
    onOpenUpdate: () => void;
    onRequestConfirmation: () => void;
    setAcademicStatus: (status: AcademicRegistrationStatus) => void;
    setAdmissionPeriod: (period: string) => void;
    setErrors: Dispatch<SetStateAction<StudentEnrollmentErrors>>;
    setSelectedCareerId: (careerId: string) => void;
}

export const CareerEnrollmentForm = ({
    canSubmit,
    careers,
    draft,
    errors,
    hasRegistrations,
    onOpenUpdate,
    onRequestConfirmation,
    setAcademicStatus,
    setAdmissionPeriod,
    setErrors,
    setSelectedCareerId,
}: CareerEnrollmentFormProps) => (
    <SectionCard>
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
                <h2 className="text-base font-semibold text-gray-900">
                    Seleccionar carrera y datos de matricula
                </h2>
            </div>

            {hasRegistrations && (
                <button
                    type="button"
                    onClick={onOpenUpdate}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-green-200 px-3 text-sm font-medium text-green-700 transition hover:bg-green-50"
                >
                    Actualizar estado existente
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField error={errors.careerId} label="Carrera" required>
                <SelectShell>
                    <select
                        value={draft.careerId}
                        onChange={(event) => {
                            setSelectedCareerId(event.target.value);
                            setErrors((current) => ({
                                ...current,
                                careerId: undefined,
                                duplicate: undefined,
                            }));
                        }}
                        className={fieldClassName(Boolean(errors.careerId))}
                    >
                        <option value="">Seleccione una carrera</option>
                        {careers.map((career) => (
                            <option key={career.id} value={career.id}>
                                {career.name}
                            </option>
                        ))}
                    </select>
                </SelectShell>
            </FormField>

            <FormField
                error={errors.admissionPeriod}
                label="Periodo de ingreso"
                required
            >
                <input
                    value={draft.admissionPeriod}
                    onChange={(event) => {
                        setAdmissionPeriod(event.target.value);
                        setErrors((current) => ({
                            ...current,
                            admissionPeriod: undefined,
                        }));
                    }}
                    placeholder="Ej. 2024-1"
                    className={fieldClassName(Boolean(errors.admissionPeriod))}
                />
                <p className="mt-1 text-xs text-gray-400">
                    Formato: AAAA-N (ej. 2024-1)
                </p>
            </FormField>

            <FormField
                error={errors.academicStatus}
                label="Estado academico inicial"
                required
            >
                <SelectShell>
                    <select
                        value={draft.academicStatus}
                        onChange={(event) => {
                            setAcademicStatus(
                                event.target.value as AcademicRegistrationStatus
                            );
                            setErrors((current) => ({
                                ...current,
                                academicStatus: undefined,
                            }));
                        }}
                        className={fieldClassName(Boolean(errors.academicStatus))}
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

        {errors.duplicate && (
            <InfoBanner tone="error" title="Matricula duplicada">
                {errors.duplicate}
            </InfoBanner>
        )}

        <InfoBanner tone="info" title="Estado academico inicial">
            El estado academico inicial define la condicion del estudiante al
            momento de su matricula. Podras actualizarlo posteriormente.
        </InfoBanner>

        <div className="mt-5 flex justify-end">
            <button
                type="button"
                onClick={onRequestConfirmation}
                disabled={!canSubmit}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Continuar
            </button>
        </div>
    </SectionCard>
);
