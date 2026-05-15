import Swal from "sweetalert2";

import { EvaluationSidebar } from "../../components/evaluations/EvaluationSidebar";
import { RubricGradeTable } from "../../components/evaluations/RubricGradeTable";
import PageHeader from "../../components/ui/PageHeader";
import { useEvaluationGrading } from "../../hooks/useEvaluationGrading";

const EvaluationsPage = () => {
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
    } = useEvaluationGrading();

    const handleSaveGrade = async (status: "DRAFT" | "SUBMITTED") => {
        if (!selectedStudent) {
            Swal.fire(
                "Selecciona un estudiante",
                "Debes seleccionar un estudiante para calificar.",
                "warning"
            );
            return;
        }

        if (status === "SUBMITTED" && pendingCriteria.length > 0) {
            Swal.fire(
                "Criterios pendientes",
                "Selecciona un nivel de escala para todos los criterios antes de enviar.",
                "warning"
            );
            return;
        }

        try {
            const saved = await saveGrade(status);
            if (!saved) throw new Error();

            Swal.fire({
                title: status === "DRAFT" ? "Borrador guardado" : "Calificacion enviada",
                icon: "success",
                timer: 1600,
                showConfirmButton: false,
            });
        } catch {
            Swal.fire("Error", "No fue posible guardar la calificacion.", "error");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Evaluaciones"
                subtitle="Califica estudiantes con la rubrica asociada."
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
                    onSubmitGrade={() => handleSaveGrade("SUBMITTED")}
                />
            </div>
        </div>
    );
};

export default EvaluationsPage;
