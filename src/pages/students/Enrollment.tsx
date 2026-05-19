/**
 * AdminCareerEnrollmentPage — CU-06 / HU-06
 *
 * Postcondición CU-06 §6:
 *   "El sistema crea el registro Matricula y notifica al estudiante."
 *
 * Se reemplaza FeedbackToast propio por Notification unificado.
 */

import { useMemo, useState } from "react";

import { CareerEnrollmentForm } from "../../components/studentEnrollments/CareerEnrollmentForm";
import { ConfirmationModal } from "../../components/studentEnrollments/ConfirmationModal";
import { EnrollmentStepper } from "../../components/studentEnrollments/EnrollmentStepper";
import { EnrollmentSummaryPanel } from "../../components/studentEnrollments/EnrollmentSummaryPanel";
import { selectedStudentName } from "../../hooks/enrollmentFormatters";
import { InfoBanner } from "../../components/studentEnrollments/InfoBanner";
import { ResultModal } from "../../components/studentEnrollments/ResultModal";
import { StudentsSearchSection } from "../../components/studentEnrollments/StudentsSearchSection";
import type { ResultModalState } from "../../models/interfaces/States";
import { UpdateStatusModal } from "../../components/studentEnrollments/UpdateStatusModal";
import PageHeader from "../../components/ui/PageHeader";
import { useNotification } from "../../components/ui/Notification";
import type {
  AcademicRegistrationStatus,
  Registration,
} from "../../models/uml/Registration";
import {
  isValidAdmissionPeriod,
  type StudentEnrollmentErrors,
  type StudentEnrollmentOption,
  useStudentEnrollment,
} from "../../hooks/useStudentEnrollment";

const ITEMS_PER_PAGE = 5;

const AdminCareerEnrollmentPage = () => {
  const { notify, NotificationOutlet } = useNotification();

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
  const [updateDraft, setUpdateDraft] = useState<{
    registrationId: string;
    status: AcademicRegistrationStatus;
  }>({ registrationId: "", status: "WITHDRAWN" });

  const currentStep = useMemo(() => {
    if (!selectedStudent) return 1;
    if (!draft.careerId) return 2;
    if (!draft.admissionPeriod || !isValidAdmissionPeriod(draft.admissionPeriod)) return 3;
    return isConfirmOpen || resultModal?.type === "success" ? 4 : 3;
  }, [draft.admissionPeriod, draft.careerId, isConfirmOpen, resultModal, selectedStudent]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredStudents]);

  const selectedRegistrations = selectedStudent?.registrations ?? [];
  const selectedActiveCareer = selectedStudent?.activeRegistrations[0]?.career;
  const studentName = selectedStudentName(selectedStudent);

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
      setResultModal({ type: "duplicate", registration: activeDuplicate });
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
      setResultModal({ type: "success", registration });

      // CU-06 §6 — notificación al estudiante matriculado
      notify({
        type: "success",
        title: "Notificación enviada",
        message: `Se ha notificado a ${studentName} sobre su nueva matrícula en ${selectedCareer?.name ?? "la carrera"}.`,
        duration: 5500,
      });
    } catch (submitError) {
      notify({
        type: "error",
        title: "Matrícula no registrada",
        message:
          submitError instanceof Error
            ? submitError.message
            : "No se pudo registrar la matrícula.",
      });
    }
  };

  const openUpdateModal = (registration?: Registration) => {
    const target = registration ?? selectedRegistrations[0];
    setUpdateDraft({
      registrationId: target?.id ?? "",
      status: (target?.academic_status as AcademicRegistrationStatus) ?? "WITHDRAWN",
    });
    setIsUpdateOpen(true);
  };

  const handleUpdateRegistration = async () => {
    if (!updateDraft.registrationId) {
      notify({
        type: "warning",
        title: "Selección incompleta",
        message: "Selecciona una matrícula existente para actualizar.",
      });
      return;
    }
    try {
      await updateRegistrationStatus(updateDraft.registrationId, updateDraft.status);
      setIsUpdateOpen(false);
      setResultModal(null);
      notify({
        type: "success",
        title: "Estado actualizado",
        message: "La matrícula existente fue actualizada correctamente.",
      });
    } catch (updateError) {
      notify({
        type: "error",
        title: "No se pudo actualizar",
        message:
          updateError instanceof Error
            ? updateError.message
            : "No se pudo actualizar el estado académico.",
      });
    }
  };

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="Matricular estudiante en carrera"
        subtitle="Registra la vinculación formal de un estudiante a una carrera."
        breadcrumb={["Inicio", "Académico", "Matrículas", "Matricular estudiante"]}
      />

      <EnrollmentStepper currentStep={currentStep} />

      {error && (
        <InfoBanner tone="error" title="No fue posible cargar la información">
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

      {/* CU-06 — notificación unificada (reemplaza FeedbackToast) */}
      <NotificationOutlet />
    </div>
  );
};

export default AdminCareerEnrollmentPage;