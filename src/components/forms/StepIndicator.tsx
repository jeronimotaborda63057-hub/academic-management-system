interface StepIndicatorProps {
    currentStep: number;
    steps: string[];
}

const StepIndicator = ({
    currentStep,
    steps,
}: StepIndicatorProps) => {

    return (
        <div className="flex items-center mb-10">

            {steps.map((step, index) => {

                const stepNumber = index + 1;

                const isActive =
                    stepNumber === currentStep;

                const isCompleted =
                    stepNumber < currentStep;

                return (
                    <div
                        key={step}
                        className="flex items-center flex-1 last:flex-none"
                    >

                        {/* STEP */}
                        <div className="flex flex-col items-center">

                            <div
                                className={`
                                    w-10 h-10 rounded-full
                                    flex items-center justify-center
                                    text-sm font-semibold
                                    transition-all duration-200

                                    ${
                                        isCompleted
                                            ? "bg-green-500 text-white"
                                            : isActive
                                                ? "bg-primary text-white"
                                                : "bg-gray-200 text-gray-500"
                                    }
                                `}
                            >

                                {isCompleted ? (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    stepNumber
                                )}

                            </div>

                            <span
                                className={`
                                    mt-2 text-xs font-medium text-center whitespace-nowrap

                                    ${
                                        isActive
                                            ? "text-primary"
                                            : isCompleted
                                                ? "text-green-600"
                                                : "text-gray-500"
                                    }
                                `}
                            >
                                {step}
                            </span>

                        </div>

                        {/* LINE */}
                        {index < steps.length - 1 && (

                            <div
                                className={`
                                    flex-1 h-[2px] mx-3 mb-5 transition-all

                                    ${
                                        isCompleted
                                            ? "bg-green-500"
                                            : "bg-gray-200"
                                    }
                                `}
                            />

                        )}

                    </div>
                );
            })}

        </div>
    );
};

export default StepIndicator;