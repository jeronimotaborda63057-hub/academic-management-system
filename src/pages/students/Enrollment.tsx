import React from "react";
import Swal from "sweetalert2";

import PageHeader from "../../components/ui/PageHeader";
import {
    getStudentDisplayName,
    getStudentProfileId,
    useStudentEnrollment,
} from "../../hooks/useStudentEnrollment";

const Enrollment: React.FC = () => {
    const {
        canSubmit,
        careers,
        error,
        loading,
        selectedCareerId,
        selectedStudentId,
        setSelectedCareerId,
        setSelectedStudentId,
        students,
        submitting,
        submitEnrollment,
    } = useStudentEnrollment();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const registration = await submitEnrollment();
            if (!registration) return;

            await Swal.fire({
                icon: "success",
                title: "Matricula registrada",
                text: "El estudiante fue vinculado a la carrera correctamente.",
            });
        } catch (submitError) {
            const message = submitError instanceof Error
                ? submitError.message
                : "No se pudo registrar la matricula.";

            Swal.fire("Error", message, "error");
        }
    };

    return (
        <div>
            <PageHeader
                title="Matricula de estudiantes"
                subtitle="Vincula un estudiante activo a una carrera academica."
                breadcrumb={["Inicio", "Administracion", "Matricula"]}
            />

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                {loading ? (
                    <p className="text-sm text-gray-500">Cargando datos...</p>
                ) : error ? (
                    <p className="text-sm text-red-600">{error}</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Estudiante
                                </label>
                                <select
                                    value={selectedStudentId}
                                    onChange={(event) => setSelectedStudentId(event.target.value)}
                                    className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
                                    required
                                >
                                    <option value="">Selecciona un estudiante</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {getStudentDisplayName(student)}
                                            {getStudentProfileId(student) ? "" : " (sin perfil)"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Carrera
                                </label>
                                <select
                                    value={selectedCareerId}
                                    onChange={(event) => setSelectedCareerId(event.target.value)}
                                    className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
                                    required
                                >
                                    <option value="">Selecciona una carrera</option>
                                    {careers.map((career) => (
                                        <option key={career.id} value={career.id}>
                                            {career.name} ({career.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-gray-100 pt-5">
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="h-11 rounded-lg bg-primary px-5 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? "Guardando..." : "Registrar matricula"}
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
};

export default Enrollment;
