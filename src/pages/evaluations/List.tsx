/**
 * EvaluationsPage — CU-11 / HU-11
 *
 * Postcondición CU-11 §6 (flujo "enviar"):
 *   "Al enviar: el sistema calcula Nota.nota_final como suma ponderada de los
 *    CalificacionDetalle.puntaje y notifica al estudiante."
 * Excepción CU-11 E1:
 *   "Algún Criterio sin escala_id seleccionado al intentar enviar →
 *    el sistema bloquea e indica los criterios pendientes."
 *
 * Las advertencias síncronas (E1, nota bloqueada, sin estudiante) se muestran
 * con el Notification unificado. El feedback de éxito/error post-envío también.
 */

import axios from "axios";

import { EvaluationSidebar } from "../../components/evaluations/EvaluationSidebar";
import { RubricGradeTable } from "../../components/evaluations/RubricGradeTable";
import PageHeader from "../../components/ui/PageHeader";
import { useNotification } from "../../components/ui/Notification";
import { useEvaluationGrading } from "../../hooks/useEvaluationGrading";

const EvaluationsPage = () => {
  const { notify, NotificationOutlet } = useNotification();

  const {
    criteria,
    draft,
    error,
    evaluations,
    existingGrade,
    finalScore,
    loading,
    pendingCriteria,
    rubricTitle,
    saveGrade,
    saving,
    scales,
    scalesByCriterion,
    selectedEnrollmentId,
    selectedEvaluationId,
    selectedStudent,
    setSelectedEnrollmentId,
    setSelectedEvaluationId,
    students,
    updateComment,
    updateScale,
    isLocked,
  } = useEvaluationGrading();

  const handleSaveGrade = async (status: "DRAFT" | "SENT") => {
    // Nota ya confirmada — bloqueo inmediato
    if (isLocked) {
      notify({
        type: "warning",
        title: "Nota bloqueada",
        message: "Esta nota ya fue confirmada oficialmente y no puede editarse.",
      });
      return;
    }

    if (!selectedStudent) {
      notify({
        type: "warning",
        title: "Selecciona un estudiante",
        message: "Debes seleccionar un estudiante para calificar.",
      });
      return;
    }

    // CU-11 E1 — criterios pendientes al intentar enviar
    if (status === "SENT" && pendingCriteria.length > 0) {
      const names = pendingCriteria.map((c) => c.name).join(", ");
      notify({
        type: "warning",
        title: "Criterios pendientes",
        message: `Asigna un nivel de escala a: ${names}.`,
        duration: 7000,
      });
      return;
    }

    try {
      const saved = await saveGrade(status);
      if (!saved) throw new Error();

      if (status === "SENT") {
        // CU-11 §6 — notificación al estudiante cuando se envía la calificación
        const studentName = selectedStudent.student
          ? `${selectedStudent.student.first_name} ${selectedStudent.student.last_name}`
          : "el estudiante";

        notify({
          type: "success",
          title: "Calificación enviada",
          message: `Se notificó a ${studentName} sobre su calificación (nota: ${finalScore.toFixed(1)}).`,
          duration: 5500,
        });
      } else {
        notify({
          type: "info",
          title: "Borrador guardado",
          message: "La calificación fue guardada como borrador y puede editarse.",
        });
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "No fue posible guardar la calificación."
        : "No fue posible guardar la calificación.";

      console.error(err);
      notify({ type: "error", title: "Error al guardar", message });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluaciones"
        subtitle="Califica estudiantes con la rúbrica asociada."
        breadcrumb={["Inicio", "Evaluaciones"]}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        <EvaluationSidebar
          evaluations={evaluations}
          students={students}
          selectedEvaluationId={selectedEvaluationId}
          selectedEnrollmentId={selectedEnrollmentId}
          rubricTitle={rubricTitle}
          existingGrade={existingGrade}
          selectedStudent={selectedStudent}
          onEvaluationChange={setSelectedEvaluationId}
          onEnrollmentChange={setSelectedEnrollmentId}
        />

        <RubricGradeTable
          criteria={criteria}
          draft={draft}
          finalScore={finalScore}
          loading={loading}
          saving={saving}
          scales={scales}
          scalesByCriterion={scalesByCriterion}
          selectedStudent={selectedStudent}
          selectedEnrollmentId={selectedEnrollmentId}
          onScaleChange={updateScale}
          onCommentChange={updateComment}
          onSaveDraft={() => handleSaveGrade("DRAFT")}
          onSubmitGrade={() => handleSaveGrade("SENT")}
          isLocked={isLocked}
        />
      </div>

      {/* CU-11 — notificación unificada */}
      <NotificationOutlet />
    </div>
  );
};

export default EvaluationsPage;
