import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Swal from "sweetalert2";

import RubricAssociationTable from
    "../../components/evaluations/RubricAssociationTable";

import { evaluationRubricService } from
    "../../services/evaluationRubricService";

import type { Evaluation } from "../../models/Evaluation";
import type { Rubric } from "../../models/Rubric";
import type { Subject } from "../../models/Subject";

export default function AssociateRubricPage() {

    const navigate = useNavigate();

    const { id } = useParams();

    const [loading, setLoading] = useState(true);

    const [evaluation, setEvaluation] =
        useState<Evaluation | null>(null);

    const [rubrics, setRubrics] =
        useState<Rubric[]>([]);

    const [subjects, setSubjects] =
        useState<Subject[]>([]);

    const [selectedRubric, setSelectedRubric] =
        useState<Rubric | null>(null);

    const [selectedSubjectId, setSelectedSubjectId] =
        useState("");

    useEffect(() => {

        const load = async () => {

            /**
             * Si no existe ID,
             * detener loading.
             */
            if (!id) {
                setLoading(false);
                return;
            }

            try {

                const [
                    evaluationData,
                    rubricsData,
                    subjectsData,
                ] = await Promise.all([
                    evaluationRubricService.getEvaluation(
                        id,
                    ),

                    evaluationRubricService
                        .getPublishedRubrics(),

                    evaluationRubricService
                        .getSubjects(),
                ]);

                /**
                 * Validar evaluación.
                 */
                if (!evaluationData) {

                    Swal.fire({
                        icon: "error",
                        title: "Evaluación no encontrada",
                    });

                    navigate(-1);

                    return;
                }

                setEvaluation(evaluationData);

                setRubrics(rubricsData);

                setSubjects(subjectsData);

                /**
                 * Precargar asignatura.
                 */
                if (
                    evaluationData &&
                    evaluationData.subject_id
                ) {
                    setSelectedSubjectId(
                        String(evaluationData.subject_id),
                    );
                }

            }
            catch (error) {

                console.error(error);

                Swal.fire({
                    icon: "error",
                    title: "Error al cargar información",
                    text: "No fue posible cargar los datos.",
                });
            }
            finally {

                /**
                 * Siempre detener loading.
                 */
                setLoading(false);
            }
        };

        load();

    }, [id, navigate]);

    const handleAssociate = async () => {

        if (!evaluation) return;

        if (!selectedRubric) {

            Swal.fire({
                icon: "warning",
                title: "Selecciona una rúbrica",
            });

            return;
        }

        if (!selectedSubjectId) {

            Swal.fire({
                icon: "warning",
                title: "Selecciona una asignatura",
            });

            return;
        }

        if (evaluation.rubric_id) {

            const hasGrades =
                await evaluationRubricService
                    .hasGrades(Number(evaluation.id));

            if (hasGrades) {

                Swal.fire({
                    icon: "error",
                    title: "No se puede reemplazar",
                    text: `
                        La evaluación ya tiene
                        calificaciones registradas.
                    `,
                });

                return;
            }
        }

        await evaluationRubricService.associate(
            Number(evaluation.id),
            Number(selectedRubric.id),
            Number(selectedSubjectId),
        );

        Swal.fire({
            icon: "success",
            title: "Rúbrica asociada",
            text: "La asociación fue exitosa.",
        });

        navigate(-1);
    };

    if (loading) {
        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-6 text-sm text-gray-500
            ">
                Cargando información...
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div className="
                rounded-2xl border border-gray-200
                bg-white p-6 shadow-sm
            ">

                <div className="mb-6">

                    <h1 className="
                        text-2xl font-bold text-gray-900
                    ">
                        Asociar rúbrica
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Selecciona una rúbrica publicada
                        para esta evaluación.
                    </p>
                </div>

                {evaluation && (
                    <div className="
                        mb-6 rounded-2xl
                        bg-gray-50 p-4
                    ">
                        <p className="
                            text-sm font-medium text-gray-700
                        ">
                            Evaluación
                        </p>

                        <p className="
                            mt-1 text-lg font-semibold text-gray-900
                        ">
                            {evaluation.name}
                        </p>
                    </div>
                )}

                <div className="mb-6">

                    <label className="
                        mb-2 block text-sm
                        font-medium text-gray-700
                    ">
                        Asignatura
                    </label>

                    <select
                        value={selectedSubjectId}
                        onChange={(e) =>
                            setSelectedSubjectId(e.target.value)
                        }
                        className="
                            w-full rounded-xl
                            border border-gray-200
                            px-4 py-3 outline-none
                            transition focus:border-primary
                        "
                    >
                        <option value="">
                            Selecciona una asignatura
                        </option>

                        {subjects.map((subject) => (
                            <option
                                key={subject.id}
                                value={subject.id}
                            >
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>

                {rubrics.length === 0 ? (
                    <div className="
                        rounded-2xl border border-red-200
                        bg-red-50 p-6 text-red-700
                    ">
                        No existen rúbricas publicadas.
                    </div>
                ) : (
                    <RubricAssociationTable
                        rubrics={rubrics}
                        selectedRubric={selectedRubric}
                        onSelect={setSelectedRubric}
                    />
                )}

                <div className="
                    mt-6 flex justify-end gap-3
                ">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            rounded-xl border border-gray-200
                            px-5 py-3 text-sm font-medium
                            text-gray-700 transition
                            hover:bg-gray-50
                        "
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleAssociate}
                        className="
                            rounded-xl bg-primary
                            px-6 py-3 text-sm
                            font-semibold text-white
                            transition hover:opacity-90
                        "
                    >
                        Confirmar asociación
                    </button>
                </div>
            </div>
        </div>
    );
}