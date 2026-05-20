import React, { useState } from "react";
import FormField from "./FormField";
import ProfileStep from "./ProfileStep";
import StepIndicator from "./StepIndicator";
import PageHeader from "../ui/PageHeader";
import type { StepField } from "../../models/interfaces/StepField";

const STEPS = ["Datos de usuario", "Datos de perfil"];

export type MultiStepFormValues = Record<string, string>;

interface MultiStepFormProps {
    title: string;
    subtitle: string;
    breadcrumb: string[];
    step1Fields: StepField[];
    initialValues?: MultiStepFormValues;
    onSubmit: (values: MultiStepFormValues) => Promise<void>;
    onBeforeNext?: (values: MultiStepFormValues) => Promise<Record<string, string>>;
    isLoading?: boolean;
    isEditing?: boolean;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
    title,
    subtitle,
    breadcrumb,
    step1Fields,
    initialValues = {},
    onSubmit,
    onBeforeNext,
    isLoading = false,
}) => {
    const [currentStep,  setCurrentStep]  = useState(1);
    const [fieldErrors,  setFieldErrors]  = useState<Record<string, string>>({});
    const [isValidating, setIsValidating] = useState(false);

    const [values, setValues] = useState<MultiStepFormValues>(() => {
        const defaults: MultiStepFormValues = { role: "STUDENT" };
        step1Fields.forEach((f) => { defaults[f.name] = ""; });
        return { ...defaults, ...initialValues };
    });

    const resolvePrefix = (field: StepField): string | undefined => {
        if (!field.prefix) return undefined;
        if (typeof field.prefix === "function") return field.prefix(values);
        return field.prefix;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        const field = step1Fields.find((f) => f.name === name);
        if (field?.prefix && !/^\d*$/.test(value)) return;

        setValues((prev) => ({ ...prev, [name]: value }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();

        if (onBeforeNext) {
            setIsValidating(true);
            const errors = await onBeforeNext(values);
            setIsValidating(false);

            if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
                return; // 🔴 no avanza al paso 2
            }
        }

        setFieldErrors({});

        // ADMIN no tiene step 2 — va directo a submit
        if (values.role === "ADMIN") {
            onSubmit(values);
            return;
        }

        setCurrentStep(2);
    };

    const handleBack = () => setCurrentStep(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
    };

    return (
        <div>
            <PageHeader title={title} subtitle={subtitle} breadcrumb={breadcrumb} />

            <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6">
                <StepIndicator currentStep={currentStep} steps={STEPS} />

                {/* Step 1 — Datos de usuario */}
                {currentStep === 1 && (
                    <form onSubmit={handleNext} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {step1Fields.map((field) => {
                                const prefix = resolvePrefix(field);

                                return (
                                    <div key={field.name} className="flex flex-col gap-1">
                                        {prefix ? (
                                            <div className="flex flex-col gap-1">
                                                <label className="text-sm font-medium text-black dark:text-white">
                                                    {field.label}
                                                    {field.required && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                </label>
                                                <div className="relative flex items-center">
                                                    <span className="absolute left-3 text-sm text-gray-500 select-none pointer-events-none">
                                                        {prefix}
                                                    </span>
                                                    <input
                                                        name={field.name}
                                                        type="text"
                                                        inputMode="numeric"
                                                        required={field.required}
                                                        value={values[field.name] ?? ""}
                                                        onChange={handleChange}
                                                        placeholder="000"
                                                        className={`w-full border rounded-lg py-2 pr-3 pl-14 text-sm bg-transparent dark:text-white
                                                            ${fieldErrors[field.name]
                                                                ? "border-red-500 focus:ring-red-400"
                                                                : "border-stroke dark:border-strokedark focus:ring-primary"
                                                            } focus:outline-none focus:ring-2`}
                                                    />
                                                </div>
                                                {fieldErrors[field.name] && (
                                                    <p className="text-xs text-red-500">
                                                        {fieldErrors[field.name]}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <FormField
                                                    field={field}
                                                    value={values[field.name] ?? ""}
                                                    onChange={handleChange}
                                                />
                                                {fieldErrors[field.name] && (
                                                    <p className="text-xs text-red-500 -mt-1">
                                                        {fieldErrors[field.name]}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isValidating}
                                className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                            >
                                {isValidating
                                    ? "Verificando..."
                                    : values.role === "ADMIN"
                                        ? "Guardar"
                                        : "Siguiente →"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2 — Datos de perfil */}
                {currentStep === 2 && (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <ProfileStep
                            role={values.role}
                            values={values}
                            onChange={handleChange}
                        />

                        <div className="flex justify-between pt-2">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                            >
                                ← Atrás
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                            >
                                {isLoading ? "Guardando..." : "Guardar usuario"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MultiStepForm;
