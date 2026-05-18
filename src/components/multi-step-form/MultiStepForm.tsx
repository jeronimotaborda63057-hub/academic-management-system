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
    isLoading?: boolean;
}


const MultiStepForm: React.FC<MultiStepFormProps> = ({
    title,
    subtitle,
    breadcrumb,
    step1Fields,
    initialValues = {},
    onSubmit,
    isLoading = false,
}) => {
    const [currentStep, setCurrentStep] = useState(1);

    // ✅ Estado unificado — inicializado con valores externos si es edición
    const [values, setValues] = useState<MultiStepFormValues>(() => {
        const defaults: MultiStepFormValues = { role: "STUDENT" };
        step1Fields.forEach((f) => { defaults[f.name] = ""; });
        return { ...defaults, ...initialValues };
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        // Si es ADMIN no tiene step 2 — va directo a submit
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
            {/* Header de página */}
            <PageHeader
                title={title}
                subtitle={subtitle}
                breadcrumb={breadcrumb}
            />

            <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6">
                {/* Indicador de pasos */}
                <StepIndicator currentStep={currentStep} steps={STEPS} />

                {/* Step 1 — Datos de usuario */}
                {currentStep === 1 && (
                    <form onSubmit={handleNext} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {step1Fields.map((field) => (
                                <FormField
                                    key={field.name}
                                    field={field}
                                    value={values[field.name] ?? ""}
                                    onChange={handleChange}
                                />
                            ))}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition"
                            >
                                {values.role === "ADMIN" ? "Guardar" : "Siguiente →"}
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
