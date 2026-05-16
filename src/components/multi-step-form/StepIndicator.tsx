interface StepIndicatorProps {
    currentStep: number;
    steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
    return (
        <div className="flex items-center gap-0 mb-8">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;

                return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        {/* Círculo */}
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                                isCompleted
                                    ? "bg-green-500 text-white"
                                    : isActive
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 dark:bg-meta-4 text-gray-500 dark:text-bodydark2"
                            }`}>
                                {isCompleted ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : stepNumber}
                            </div>
                            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
                                isActive ? "text-primary" : "text-gray-500 dark:text-bodydark2"
                            }`}>
                                {step}
                            </span>
                        </div>

                        {/* Línea entre pasos */}
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${
                                isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-meta-4"
                            }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StepIndicator;