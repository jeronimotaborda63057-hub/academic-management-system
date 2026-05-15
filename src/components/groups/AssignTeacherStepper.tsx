interface AssignTeacherStepperProps {
  currentStep: number;
}

const steps = [
  {
    id: 1,
    title: "Seleccionar semestre",
  },
  {
    id: 2,
    title: "Seleccionar grupo",
  },
  {
    id: 3,
    title: "Seleccionar docente",
  },
  {
    id: 4,
    title: "Confirmar asignación",
  },
];

const AssignTeacherStepper = ({
  currentStep,
}: AssignTeacherStepperProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              className="flex items-center flex-1"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${
                      isCompleted
                        ? "bg-green-700 text-white"
                        : isActive
                        ? "bg-green-100 text-green-700 border-2 border-green-700"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                >
                  {step.id}
                </div>

                <span
                  className={`
                    text-sm font-medium whitespace-nowrap
                    ${
                      isActive || isCompleted
                        ? "text-gray-900"
                        : "text-gray-400"
                    }
                  `}
                >
                  {step.title}
                </span>
              </div>

              {index !== steps.length - 1 && (
                <div className="flex-1 h-[2px] bg-gray-200 mx-4 relative overflow-hidden rounded-full">
                  <div
                    className={`
                      absolute top-0 left-0 h-full transition-all duration-300
                      ${
                        currentStep > step.id
                          ? "w-full bg-green-700"
                          : "w-0"
                      }
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignTeacherStepper;