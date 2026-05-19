import type { AcademicRegistrationStatus } from "../../models/uml/Registration";
import type { StudentEnrollmentOption } from "../../hooks/useStudentEnrollment";
import { AcademicStatusHelp } from "./AcademicStatusHelp";
import { SectionCard } from "./SectionCard";
import { SelectedStudentCard } from "./SelectedStudentCard";
import { SummaryBlock } from "./SummaryBlock";

interface EnrollmentSummaryPanelProps {
    admissionPeriod: string;
    careerName?: string;
    currentCareerName?: string;
    selectedStudent: StudentEnrollmentOption | null;
    status: AcademicRegistrationStatus;
    studentName: string;
}

export const EnrollmentSummaryPanel = ({
    admissionPeriod,
    careerName,
    currentCareerName,
    selectedStudent,
    status,
    studentName,
}: EnrollmentSummaryPanelProps) => (
    <div className="space-y-5">
        <SectionCard>
            <h2 className="mb-4 text-base font-semibold text-gray-900">
                Información del estudiante seleccionado
            </h2>
            <SelectedStudentCard selectedStudent={selectedStudent} />
        </SectionCard>

        <SectionCard>
            <h2 className="mb-4 text-base font-semibold text-gray-900">
                Información de la matricula
            </h2>

            <div className="space-y-5">
                <SummaryBlock
                    admissionPeriod={admissionPeriod}
                    careerName={careerName}
                    currentCareerName={currentCareerName}
                    email={selectedStudent?.user.email}
                    identification={selectedStudent?.profile.identification}
                    status={status}
                    studentName={studentName}
                />

                <AcademicStatusHelp />
            </div>
        </SectionCard>
    </div>
);
