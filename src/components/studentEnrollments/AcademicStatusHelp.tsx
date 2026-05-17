import { Info } from "lucide-react";

import { ACADEMIC_STATUS_OPTIONS } from "../../hooks/useStudentEnrollment";

export const AcademicStatusHelp = () => (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-900">
            <Info size={18} className="text-blue-700" />
            Estados academicos disponibles
        </div>

        <div className="space-y-3">
            {ACADEMIC_STATUS_OPTIONS.map((option) => (
                <div
                    key={option.value}
                    className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 text-sm"
                >
                    <span className="font-semibold text-gray-900">
                        {option.label}:
                    </span>
                    <span className="text-gray-600">{option.description}</span>
                </div>
            ))}
        </div>
    </div>
);
