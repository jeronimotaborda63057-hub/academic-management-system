import type { Evaluation } from "../../models/Evaluation";
import type { Rubric } from "../../models/Rubric";
import type { Subject } from "../../models/Subject";

interface Props {
    evaluation: Evaluation | null;
    rubric: Rubric | null;
    subject: Subject | null;
}

export default function RubricAssociationSummary({
    evaluation,
    rubric,
    subject,
}: Props) {
    return (
        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">
                Resumen de asociación
            </h3>

            <div className="space-y-4 text-sm">
                <div>
                    <p className="font-medium text-gray-700">
                        Evaluación
                    </p>

                    <p className="text-gray-500">
                        {evaluation?.name ?? "Sin seleccionar"}
                    </p>
                </div>

                <div>
                    <p className="font-medium text-gray-700">
                        Rúbrica actual
                    </p>

                    <p className="text-gray-500">
                        {rubric?.title ?? "Sin seleccionar"}
                    </p>
                </div>

                <div>
                    <p className="font-medium text-gray-700">
                        Asignatura actual
                    </p>

                    <p className="text-gray-500">
                        {subject?.name ?? "Sin seleccionar"}
                    </p>
                </div>
            </div>
        </aside>
    );
}