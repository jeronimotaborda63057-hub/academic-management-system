import React from "react";
import type { StepField } from "../../models/interfaces/StepField";

interface FormFieldProps {
    field: StepField;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const FormField: React.FC<FormFieldProps> = ({ field, value, onChange }) => {
    const baseClass = "h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors w-full";

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === "select" && field.options ? (
                <select
                    name={field.name}
                    value={value}
                    onChange={onChange}
                    required={field.required}
                    className={baseClass}
                >
                    <option value="">Selecciona una opción</option>
                    {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={field.type}
                    name={field.name}
                    value={value}
                    onChange={onChange}
                    required={field.required}
                    className={baseClass}
                />
            )}
        </div>
    );
};

export default FormField;