import { useNavigate } from "react-router-dom";

import { StudentGradeDetailPanel } from "../../components/studentGrades/StudentGradeDetailPanel";
import { StudentGradeFilters } from "../../components/studentGrades/StudentGradeFilters";
import { StudentGradeOverview } from "../../components/studentGrades/StudentGradeOverview";
import { StudentGradeSidePanel } from "../../components/studentGrades/StudentGradeSidePanel";
import { getGradeFinalScore } from "../../components/studentGrades/studentGradeDisplay";
import PageHeader from "../../components/ui/PageHeader";
import { useStudentGradeDetails } from "../../hooks/useStudentGradeDetails";

const StudentGradeDetailsPage = () => {
    const navigate = useNavigate();
    const {
        detailRows,
        downloadReport,
        error,
        gradeRows,
        loading,
        selectedContext,
        selectedGradeId,
        setSelectedGradeId,
    } = useStudentGradeDetails();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Ver calificaciones detalladas"
                subtitle="Consulta el detalle de tu calificacion por criterios y niveles de desempeno."
                breadcrumb={["Inicio", "Mis calificaciones", "Detalle"]}
            />

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-sm text-gray-500">
                    Cargando calificaciones...
                </div>
            ) : gradeRows.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-sm text-gray-500">
                    Aun no tienes calificaciones oficiales publicadas.
                </div>
            ) : (
                <>
                    <StudentGradeFilters
                        grades={gradeRows}
                        selectedGradeId={selectedGradeId}
                        onSelectGrade={setSelectedGradeId}
                    />

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
                        <div className="space-y-4">
                            <StudentGradeOverview context={selectedContext} />
                            <StudentGradeDetailPanel
                                details={detailRows}
                                finalScore={getGradeFinalScore(selectedContext.grade)}
                            />
                        </div>

                        <StudentGradeSidePanel
                            context={selectedContext}
                            onDownloadReport={downloadReport}
                            onViewRubric={() => navigate("/rubrics/scales")}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentGradeDetailsPage;
