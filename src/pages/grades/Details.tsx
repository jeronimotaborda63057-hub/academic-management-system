import { useNavigate } from "react-router-dom";

import { StudentGradeDetailPanel } from "../../components/studentGrades/StudentGradeDetailPanel";
import { StudentGradeFilters } from "../../components/studentGrades/StudentGradeFilters";
import { StudentGradeOverview } from "../../components/studentGrades/StudentGradeOverview";
import { StudentGradeSidePanel } from "../../components/studentGrades/StudentGradeSidePanel";
import { getGradeFinalScore } from "../../hooks/studentGradeDisplay";
import PageHeader from "../../components/ui/PageHeader";
import { useStudentGradeDetails } from "../../hooks/useStudentGradeDetails";

const StudentGradeDetailsPage = () => {
    const navigate = useNavigate();
    const {
        availableSubjects,
        detailRows,
        downloadReport,
        error,
        filteredGrades,
        loading,
        selectedContext,
        selectedGradeId,
        selectedSubjectId,
        setSelectedGradeId,
        setSelectedSubjectId,
    } = useStudentGradeDetails();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Ver calificaciones detalladas"
                subtitle="Consulta el detalle de tu calificacion por criterios y niveles de desempeno."
                breadcrumb={["Inicio", "Mis calificaciones", "Detalle"]}
            />

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
                    Cargando calificaciones...
                </div>
            ) : filteredGrades.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
                    Aun no tienes calificaciones oficiales publicadas.
                </div>
            ) : (
                <>
                    {/* FILTROS */}
                    <StudentGradeFilters
                        grades={filteredGrades}
                        subjects={availableSubjects}
                        selectedGradeId={selectedGradeId}
                        selectedSubjectId={selectedSubjectId}
                        onSelectGrade={setSelectedGradeId}
                        onSelectSubject={setSelectedSubjectId}
                    />

                    {/* LAYOUT PRINCIPAL */}
                    <div className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_330px]">

                        {/* CONTENIDO IZQUIERDO */}
                        <div className="min-w-0 space-y-6">

                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <StudentGradeOverview
                                    context={selectedContext}
                                />
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <StudentGradeDetailPanel
                                    details={detailRows}
                                    finalScore={getGradeFinalScore(selectedContext.grade)}
                                />
                            </div>

                        </div>

                        {/* SIDEBAR DERECHO */}
                        <div className="min-w-0">

                            <div className="sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto">
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <StudentGradeSidePanel
                                        context={selectedContext}
                                        onDownloadReport={downloadReport}
                                        onViewRubric={() => navigate("/rubrics/scales")}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentGradeDetailsPage;
