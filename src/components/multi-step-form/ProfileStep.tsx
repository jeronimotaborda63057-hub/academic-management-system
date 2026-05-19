import React from "react";
import FormField from "./FormField";
import type { StepField } from "../../models/interfaces/StepField";
import type { MultiStepFormValues } from "./MultiStepForm";

const PROFILE_FIELDS_BY_ROLE: Record<string, StepField[]> = {
    STUDENT: [
        { label: "Nombre",       name: "first_name",     type: "text", required: true },
        { label: "Apellido",     name: "last_name",      type: "text", required: true },
        { label: "Cédula",       name: "identification", type: "text", required: true },
    ],
    TEACHER: [
        { label: "Nombre",       name: "first_name",     type: "text", required: true },
        { label: "Apellido",     name: "last_name",      type: "text", required: true },
        { label: "Cédula",       name: "identification", type: "text", required: true },
        { label: "Teléfono",     name: "phone",          type: "text" },
        { label: "Especialidad", name: "specialty",      type: "text" },
    ],
    ADMIN: [],
};

interface ProfileStepProps {
    role: string;
    values: MultiStepFormValues;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ role, values, onChange }) => {
    const fields = PROFILE_FIELDS_BY_ROLE[role] ?? [];

    if (fields.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
                <p className="text-sm text-gray-500 dark:text-bodydark2">
                    El rol <strong>{role}</strong> no requiere datos de perfil adicionales.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
                <FormField
                    key={field.name}
                    field={field}
                    value={values[field.name] ?? ""}
                    onChange={onChange}
                />
            ))}
        </div>
    );
};

export default ProfileStep;