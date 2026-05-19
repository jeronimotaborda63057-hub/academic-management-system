import { useMemo, useState } from "react";

import { CareerEnrollmentForm } from "../../components/studentEnrollments/CareerEnrollmentForm";
import { ConfirmationModal } from "../../components/studentEnrollments/ConfirmationModal";
import { EnrollmentStepper } from "../../components/studentEnrollments/EnrollmentStepper";
import { EnrollmentSummaryPanel } from "../../components/studentEnrollments/EnrollmentSummaryPanel";
import {
    selectedStudentName,
} from "../../components/studentEnrollments/enrollmentFormatters";
import { FeedbackToast } from "../../components/studentEnrollments/FeedbackToast";
import { InfoBanner } from "../../components/studentEnrollments/InfoBanner";
import { ResultModal } from "../../components/studentEnrollments/ResultModal";
import { StudentsSearchSection } from "../../components/studentEnrollments/StudentsSearchSection";
import type {
    ResultModalState,
    ToastState,
} from "../../components/studentEnrollments/types";
import { UpdateStatusModal } from "../../components/studentEnrollments/UpdateStatusModal";
import PageHeader from "../../components/ui/PageHeader";
import type {
    AcademicRegistrationStatus,
    Registration,
} from "../../models/Registration";
import {
    isValidAdmissionPeriod,
    type StudentEnrollmentErrors,
    type StudentEnrollmentOption,
    useStudentEnrollment,
} from "../../hooks/useStudentEnrollment";

const ITEMS_PER_PAGE = 5;

const AdminCareerEnrollmentPage = () => {
    const {
        activeDuplicate,
        canSubmit,
        careers,
        createRegistration,
        draft,
        error,
        filteredStudents,
        loading,
        search,
        selectStudent,
        selectedCareer,
        selectedStudent,
        selectedStudentId,
        setAcademicStatus,
        setAdmissionPeriod,
        setSearch,
        setSelectedCareerId,
        submitting,
        updateRegistrationStatus,
        validateDraft,
    } = useStudentEnrollment();

    const [currentPage, setCurrentPage] = useState(1);
    const [formErrors, setFormErrors] = useState<StudentEnrollmentErrors>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [resultModal, setResultModal] = useState<ResultModalState>(null);
    const [toast, setToast] = useState<ToastState>(null);
    const [updateDraft, setUpdateDraft] = useState<{
        registrationId: string;
        status: AcademicRegistrationStatus;
    }>({
        registrationId: "",
        status: "WITHDRAWN",
    });

    const currentStep = useMemo(() => {
        if (!selectedStudent) return 1;
        if (!draft.careerId) return 2;
        if (!draft.admissionPeriod || !isValidAdmissionPeriod(draft.admissionPeriod)) {
            return 3;
        }

        return isConfirmOpen || resultModal?.type === "success" ? 4 : 3;
    }, [
        draft.admissionPeriod,
        draft.careerId,
        isConfirmOpen,
        resultModal,
        selectedStudent,
    ]);

    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
    }, [currentPage, filteredStudents]);

    const selectedRegistrations = selectedStudent?.registrations ?? [];
    const selectedActiveCareer = selectedStudent?.activeRegistrations[0]?.career;
    const studentName = selectedStudentName(selectedStudent);

    const showToast = (nextToast: ToastState) => {
        setToast(nextToast);
        window.setTimeout(() => setToast(null), 4200);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleSelectStudent = (option: StudentEnrollmentOption) => {
        selectStudent(option.user.id);
        setFormErrors({});
        setIsConfirmOpen(false);
        setResultModal(null);
    };

    const handleRequestConfirmation = () => {
        const validation = validateDraft(true);
        setFormErrors(validation);

        if (validation.duplicate) {
            setResultModal({
                type: "duplicate",
                registration: activeDuplicate,
            });
            return;
        }

        if (Object.keys(validation).length > 0) return;

        setIsConfirmOpen(true);
    };

    const handleCreateRegistration = async () => {
        try {
            const registration = await createRegistration();
            if (!registration) return;

            setIsConfirmOpen(false);
            setResultModal({
                type: "success",
                registration,
            });
            showToast({
                type: "success",
                title: "Notificacion enviada",
                message: `Se ha notificado a ${studentName} sobre su nueva matricula.`,
            });
        } catch (submitError) {
            showToast({
                type: "error",
                title: "Matricula no registrada",
                message:
                    submitError instanceof Error
                        ? submitError.message
                        : "No se pudo registrar la matricula.",
            });
        }
    };

    const openUpdateModal = (registration?: Registration) => {
        const targetRegistration = registration ?? selectedRegistrations[0];
        setUpdateDraft({
            registrationId: targetRegistration?.id ?? "",
            status:
                (targetRegistration?.academic_status as AcademicRegistrationStatus) ??
                "WITHDRAWN",
        });
        setIsUpdateOpen(true);
    };

    const handleUpdateRegistration = async () => {
        if (!updateDraft.registrationId) {
            showToast({
                type: "error",
                title: "Seleccion incompleta",
                message: "Selecciona una matricula existente para actualizar.",
            });
            return;
        }

        try {
            await updateRegistrationStatus(updateDraft.registrationId, updateDraft.status);
            setIsUpdateOpen(false);
            setResultModal(null);
            showToast({
                type: "success",
                title: "Estado actualizado",
                message: "La matricula existente fue actualizada correctamente.",
            });
        } catch (updateError) {
            showToast({
                type: "error",
                title: "No se pudo actualizar",
                message:
                    updateError instanceof Error
                        ? updateError.message
                        : "No se pudo actualizar el estado academico.",
            });
        }
    };

    return (
        <div className="space-y-5 p-6">
            <PageHeader
                title="Matricular estudiante en carrera"
                subtitle="Registra la vinculacion formal de un estudiante a una carrera."
                breadcrumb={["Inicio", "Academico", "Matriculas", "Matricular estudiante"]}
            />

            <EnrollmentStepper currentStep={currentStep} />

            {error && (
                <InfoBanner tone="error" title="No fue posible cargar la informacion">
                    {error}
                </InfoBanner>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
                <div className="space-y-5">
                    <StudentsSearchSection
                        currentPage={currentPage}
                        filteredStudents={filteredStudents}
                        itemsPerPage={ITEMS_PER_PAGE}
                        loading={loading}
                        onPageChange={setCurrentPage}
                        onSearchChange={handleSearchChange}
                        onSelectStudent={handleSelectStudent}
                        paginatedStudents={paginatedStudents}
                        search={search}
                        selectedStudentId={selectedStudentId}
                    />

                    <CareerEnrollmentForm
                        canSubmit={canSubmit}
                        careers={careers}
                        draft={draft}
                        errors={formErrors}
                        hasRegistrations={selectedRegistrations.length > 0}
                        onOpenUpdate={() => openUpdateModal(activeDuplicate)}
                        onRequestConfirmation={handleRequestConfirmation}
                        setAcademicStatus={setAcademicStatus}
                        setAdmissionPeriod={setAdmissionPeriod}
                        setErrors={setFormErrors}
                        setSelectedCareerId={setSelectedCareerId}
                    />
                </div>

                <EnrollmentSummaryPanel
                    admissionPeriod={draft.admissionPeriod}
                    careerName={selectedCareer?.name}
                    currentCareerName={selectedActiveCareer?.name}
                    selectedStudent={selectedStudent}
                    status={draft.academicStatus}
                    studentName={studentName}
                />
            </div>

            <UpdateStatusModal
                isOpen={isUpdateOpen}
                onClose={() => setIsUpdateOpen(false)}
                onConfirm={handleUpdateRegistration}
                registrations={selectedRegistrations}
                selectedRegistrationId={updateDraft.registrationId}
                selectedStatus={updateDraft.status}
                setRegistrationId={(registrationId) =>
                    setUpdateDraft((current) => ({ ...current, registrationId }))
                }
                setStatus={(status) =>
                    setUpdateDraft((current) => ({ ...current, status }))
                }
                submitting={submitting}
            />

            <ConfirmationModal
                admissionPeriod={draft.admissionPeriod}
                careerName={selectedCareer?.name}
                identification={selectedStudent?.profile.identification}
                isOpen={isConfirmOpen}
                onBack={() => setIsConfirmOpen(false)}
                onConfirm={handleCreateRegistration}
                status={draft.academicStatus}
                studentName={studentName}
                submitting={submitting}
            />

            <ResultModal
                activeDuplicate={activeDuplicate}
                careerName={selectedCareer?.name}
                isOpen={Boolean(resultModal)}
                onClose={() => setResultModal(null)}
                result={resultModal}
                studentName={studentName}
            />

            <FeedbackToast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
};

export default AdminCareerEnrollmentPage;
