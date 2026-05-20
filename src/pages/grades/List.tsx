import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { FinalGradeActions } from "../../components/grades/FinalGradeActions";
import { FinalGradeSidebar } from "../../components/grades/FinalGradeSidebar";
import { FinalGradeSummary } from "../../components/grades/FinalGradeSummary";
import { FinalGradesTable } from "../../components/grades/FinalGradesTable";
import PageHeader from "../../components/ui/PageHeader";
import { useFinalGrades } from "../../hooks/useFinalGrades";
import type { FinalGradeRow } from "../../models/interfaces/FinalGradeRow";

const FinalGradesPage = () => {
    const navigate = useNavigate();
    const {
        activeGroups,
        activeSemester,
        downloadReport,
        error,
        finalizeOfficialGrades,
        groupEvaluations,
        loading,
        rows,
        saving,
        selectedGroupSemesterIsActive,
        selectedGroupId,
        setSelectedGroupId,
        summary,
    } = useFinalGrades();

    const handleFinalize = async () => {
        if (!activeSemester) {
            Swal.fire(
                "Semestre inactivo",
                "No existe un semestre activo para registrar notas oficiales.",
                "error"
            );
            return;
        }

        if (!selectedGroupSemesterIsActive) {
            Swal.fire(
                "Grupo fuera del semestre activo",
                "El grupo seleccionado no pertenece al semestre activo. No se puede registrar la nota oficial.",
                "error"
            );
            return;
        }

        const incompleteRows = rows.filter((row) => !row.isComplete);
        const result = await Swal.fire({
            title: "Registrar notas oficiales",
            text: incompleteRows.length > 0
                ? `Hay ${incompleteRows.length} estudiante(s) con notas parciales. Se registraran con observaciones.`
                : "Las notas quedaran bloqueadas como registro oficial.",
            icon: incompleteRows.length > 0 ? "warning" : "question",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        try {
            await finalizeOfficialGrades();
            Swal.fire({
                title: "Notas registradas",
                icon: "success",
                timer: 1600,
                showConfirmButton: false,
            });
        } catch {
            Swal.fire("Error", "No fue posible registrar las notas oficiales.", "error");
        }
    };

    const handleReview = (row: FinalGradeRow) => {
        const targetEvaluation = row.incompleteEvaluations[0];

        navigate("/evaluations", {
            state: {
                evaluationId: targetEvaluation?.id,
                studentId: row.studentId,
            },
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Notas finales"
                subtitle="Consolida y registra oficialmente las calificaciones del grupo."
                breadcrumb={["Inicio", "Calificaciones"]}
            />

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
                <FinalGradeSidebar
                    activeSemester={activeSemester}
                    groups={activeGroups}
                    selectedGroupIsInActiveSemester={selectedGroupSemesterIsActive}
                    selectedGroupId={selectedGroupId}
                    onGroupChange={setSelectedGroupId}
                />

                <div className="space-y-5">
                    <FinalGradeSummary
                        completeCount={summary.completeCount}
                        evaluationCount={summary.evaluationCount}
                        incompleteCount={summary.incompleteCount}
                        lockedCount={summary.lockedCount}
                        studentCount={summary.studentCount}
                    />

                    {loading ? (
                        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
                            Cargando consolidado...
                        </div>
                    ) : (
                        <FinalGradesTable
                            rows={rows}
                            onReview={handleReview}
                        />
                    )}

                    <FinalGradeActions
                        canFinalize={Boolean(activeSemester && selectedGroupSemesterIsActive && rows.length > 0 && groupEvaluations.length > 0)}
                        saving={saving}
                        onDownloadReport={downloadReport}
                        onFinalize={handleFinalize}
                    />
                </div>
            </div>
        </div>
    );
};

export default FinalGradesPage;
