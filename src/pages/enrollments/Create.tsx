/**
 * EnrollmentCreatePage — CU-07 / HU-07
 *
 * Postcondición CU-07 §7:
 *   "El sistema crea cada Inscripcion y notifica al estudiante."
 * Excepción CU-07 E2:
 *   "Grupo sin cupo disponible → el sistema notifica la indisponibilidad."
 *
 * Se reemplaza sweetalert2 por Notification unificado en los casos
 * que requieren feedback inmediato post-acción (éxito/error).
 * Se conserva Swal para confirmaciones interactivas (diálogos modales
 * con decisión del usuario).
 */

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { ExistingEnrollmentsPanel } from "../../components/groupEnrollments/ExistingEnrollmentsPanel";
import { GroupEnrollmentActions } from "../../components/groupEnrollments/GroupEnrollmentActions";
import { GroupEnrollmentTable } from "../../components/groupEnrollments/GroupEnrollmentTable";
import { StudentEnrollmentSelector } from "../../components/groupEnrollments/StudentEnrollmentSelector";
import { StudentEnrollmentSummary } from "../../components/groupEnrollments/StudentEnrollmentSummary";
import PageHeader from "../../components/ui/PageHeader";
import { useNotification } from "../../components/ui/Notification";
import { useGroupEnrollment } from "../../hooks/useGroupEnrollment";

const EnrollmentCreatePage = () => {
  const navigate = useNavigate();
  const { notify, NotificationOutlet } = useNotification();

  const {
    activeSemester,
    cancelEnrollment,
    createEnrollments,
    enrollableStudents,
    error,
    existingEnrollmentRows,
    groupRows,
    hasOutOfPlanSelection,
    loading,
    maxCredits,
    search,
    selectedCredits,
    selectedGroupIds,
    selectedStudent,
    selectedStudentId,
    setSearch,
    setSelectedStudentId,
    submitting,
    toggleGroup,
    validationError,
  } = useGroupEnrollment();

  const noActiveRegistration =
    !!selectedStudentId && !selectedStudent?.activeRegistration;

  const handleSubmit = async () => {
    if (validationError) {
      // Validación síncrona — advertencia modal (requiere decisión)
      Swal.fire("No se puede inscribir", validationError, "warning");
      return;
    }

    if (hasOutOfPlanSelection) {
      // E4: asignatura fuera del plan — requiere confirmación explícita del admin
      const result = await Swal.fire({
        title: "Asignatura fuera del plan",
        text: "Alguno de los grupos seleccionados no pertenece al plan de estudios de la carrera. Puedes continuar bajo confirmación.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Continuar",
        cancelButtonText: "Revisar",
      });
      if (!result.isConfirmed) return;
    }

    try {
      await createEnrollments();

      // CU-07 §7 — notificación al estudiante inscrito
      notify({
        type: "success",
        title: "Inscripción creada",
        message: `Se notificó al estudiante sobre su inscripción en los grupos seleccionados.`,
        duration: 5000,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No fue posible inscribir al estudiante.";

      // E2: grupo sin cupo — notificación de indisponibilidad
      notify({
        type: "error",
        title: "No se pudo inscribir",
        message,
        duration: 6000,
      });
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    // Requiere confirmación explícita — se mantiene Swal modal
    const result = await Swal.fire({
      title: "Cancelar inscripción",
      text: "La inscripción se marcará como inactiva, sin eliminar el registro.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cancelar inscripción",
      cancelButtonText: "Volver",
    });

    if (!result.isConfirmed) return;

    try {
      await cancelEnrollment(enrollmentId);
      notify({
        type: "success",
        title: "Inscripción cancelada",
        message: "El estado de la inscripción fue actualizado.",
      });
    } catch {
      notify({
        type: "error",
        title: "No se pudo cancelar",
        message: "No fue posible cancelar la inscripción.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inscribir estudiante en grupo"
        subtitle="Vincula estudiantes con grupos del semestre activo."
        breadcrumb={["Académico", "Inscripciones", "Nueva"]}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!activeSemester && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No hay semestre activo. Puedes revisar datos, pero la inscripción debería bloquearse desde backend.
        </div>
      )}

      <StudentEnrollmentSelector
        search={search}
        selectedStudentId={selectedStudentId}
        students={enrollableStudents}
        onSearchChange={setSearch}
        onStudentChange={setSelectedStudentId}
      />

      {noActiveRegistration && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 flex items-center justify-between gap-4">
          <p>
            El estudiante seleccionado no tiene una matrícula activa en ninguna carrera.
            Debes matricularlo antes de inscribirlo en un grupo.
          </p>
          <button
            onClick={() => navigate("/admin/enrollment")}
            className="shrink-0 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-medium transition-all"
          >
            Matricular estudiante
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
          Cargando información...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <StudentEnrollmentSummary
              selectedStudent={selectedStudent}
              selectedCredits={selectedCredits}
              maxCredits={maxCredits}
            />
            <ExistingEnrollmentsPanel
              enrollments={existingEnrollmentRows}
              onCancelEnrollment={handleCancelEnrollment}
            />
          </div>

          <div className="space-y-5">
            <GroupEnrollmentTable
              groups={groupRows}
              selectedGroupIds={selectedGroupIds}
              onToggleGroup={toggleGroup}
            />

            {validationError && !noActiveRegistration && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {validationError}
              </div>
            )}

            <GroupEnrollmentActions
              canSubmit={!validationError}
              isSubmitting={submitting}
              onCancel={() => navigate("/enrollments/list")}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}

      {/* CU-07 — notificación unificada */}
      <NotificationOutlet />
    </div>
  );
};

export default EnrollmentCreatePage;