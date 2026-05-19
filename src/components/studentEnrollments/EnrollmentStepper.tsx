interface EnrollmentStepperProps {
    currentStep: number;
}

const steps = [
    "Buscar estudiante",
    "Seleccionar carrera",
    "Datos de matricula",
    "Confirmar",
];

export const EnrollmentStepper = ({ currentStep }: EnrollmentStepperProps) => (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex min-w-0 items-center">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <div
                        key={step}
                        className="flex min-w-0 flex-1 items-center last:flex-none"
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                    isCompleted || isActive
                                        ? "bg-green-700 text-white"
                                        : "bg-gray-100 text-gray-500"
                                }`}
                            >
                                {stepNumber}
                            </span>
                            <span
                                className={`truncate text-sm font-medium ${
                                    isCompleted || isActive
                                        ? "text-gray-900"
                                        : "text-gray-500"
                                }`}
                            >
                                {step}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div className="mx-5 h-px flex-1 bg-gray-200" />
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);
