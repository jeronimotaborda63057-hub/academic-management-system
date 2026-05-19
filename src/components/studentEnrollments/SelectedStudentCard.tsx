import { UserRound } from "lucide-react";

import type { StudentEnrollmentOption } from "../../hooks/useStudentEnrollment";
import { getStudentDisplayName } from "../../hooks/useStudentEnrollment";
import { StatusBadge } from "./StatusBadge";

interface SelectedStudentCardProps {
    selectedStudent: StudentEnrollmentOption | null;
}

export const SelectedStudentCard = ({
    selectedStudent,
}: SelectedStudentCardProps) => {
    if (!selectedStudent) {
        return (
            <div className="rounded-lg border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                Selecciona un estudiante para ver su informacion.
            </div>
        );
    }

    return (
        <div className="flex gap-4 rounded-lg border border-green-100 bg-green-50/70 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                <UserRound size={26} />
            </div>

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                        {getStudentDisplayName(selectedStudent.user)}
                    </h3>
                    <StatusBadge status="ACTIVE" />
                </div>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                    <span>
                        <strong className="text-gray-900">Identificación:</strong>{" "}
                        {selectedStudent.profile.identification}
                    </span>
                    <span>
                        <strong className="text-gray-900">Email:</strong>{" "}
                        {selectedStudent.user.email}
                    </span>
                    <span>
                        <strong className="text-gray-900">Código:</strong>{" "}
                        {selectedStudent.user.code}
                    </span>
                </div>
            </div>
        </div>
    );
};
