import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { ExistingEnrollmentsPanel } from "../../components/groupEnrollments/ExistingEnrollmentsPanel";
import { GroupEnrollmentActions } from "../../components/groupEnrollments/GroupEnrollmentActions";
import { GroupEnrollmentTable } from "../../components/groupEnrollments/GroupEnrollmentTable";
import { StudentEnrollmentSelector } from "../../components/groupEnrollments/StudentEnrollmentSelector";
import { StudentEnrollmentSummary } from "../../components/groupEnrollments/StudentEnrollmentSummary";
import PageHeader from "../../components/ui/PageHeader";
import { useGroupEnrollment } from "../../hooks/useGroupEnrollment";

const EnrollmentCreatePage = () => {
    const navigate = useNavigate();
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

    const handleSubmit = async () => {
        if (validationError) {
            Swal.fire("No se puede inscribir", validationError, "warning");
            return;
        }

        if (hasOutOfPlanSelection) {
            const result = await Swal.fire({
                title: "Asignatura fuera del plan",
                text: "Alguno de los grupos seleccionados no pertenece al plan de estudios de la carrera. Puedes continuar bajo confirmacion.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Continuar",
                cancelButtonText: "Revisar",
            });

            if (!result.isConfirmed) return;
        }

        try {
            await createEnrollments();
            Swal.fire({
                title: "Inscripcion creada",
                icon: "success",
                timer: 1600,
                showConfirmButton: false,
            });
        } catch {
            Swal.fire("Error", "No fue posible inscribir al estudiante.", "error");
        }
    };

    const handleCancelEnrollment = async (enrollmentId: string) => {
        const result = await Swal.fire({
            title: "Cancelar inscripcion",
            text: "La inscripcion se marcara como inactiva, sin eliminar el registro.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Cancelar inscripcion",
            cancelButtonText: "Volver",
        });

        if (!result.isConfirmed) return;

        try {
            await cancelEnrollment(enrollmentId);
            Swal.fire({
                title: "Inscripcion cancelada",
                icon: "success",
                timer: 1600,
                showConfirmButton: false,
            });
        } catch {
            Swal.fire("Error", "No fue posible cancelar la inscripcion.", "error");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Inscribir estudiante en grupo"
                subtitle="Vincula estudiantes con grupos del semestre activo."
                breadcrumb={["Academico", "Inscripciones", "Nueva"]}
            />

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {!activeSemester && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    No hay semestre activo. Puedes revisar datos, pero la inscripcion deberia bloquearse desde backend.
                </div>
            )}

            <StudentEnrollmentSelector
                search={search}
                selectedStudentId={selectedStudentId}
                students={enrollableStudents}
                onSearchChange={setSearch}
                onStudentChange={setSelectedStudentId}
            />

            {loading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
                    Cargando informacion...
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

                        {validationError && (
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
        </div>
    );
};

export default EnrollmentCreatePage;
