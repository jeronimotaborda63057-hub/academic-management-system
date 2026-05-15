import type { Enrollment } from "../../models/Enrollment";
import type { Evaluation } from "../../models/Evaluation";
import type { Grade } from "../../models/Grade";
import {
    getGradeScore,
    getStudentIdentification,
    getStudentOptionLabel,
} from "../../hooks/evaluationDisplay";

interface EvaluationSidebarProps {
    evaluations: Evaluation[];
    enrollments: Enrollment[];
    selectedEvaluationId: string;
    selectedEnrollmentId: string;
    rubricTitle: string;
    existingGrade?: Grade;
    selectedEnrollment?: Enrollment;
    onEvaluationChange: (id: string) => void;
    onEnrollmentChange: (id: string) => void;
}

export const EvaluationSidebar = ({
    evaluations,
    enrollments,
    selectedEvaluationId,
    selectedEnrollmentId,
    rubricTitle,
    existingGrade,
    selectedEnrollment,
    onEvaluationChange,
    onEnrollmentChange,
}: EvaluationSidebarProps) => (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
        <div>
            <label className="text-xs font-semibold uppercase text-gray-400">
                Evaluacion
            </label>
            <select
                value={selectedEvaluationId}
                onChange={(event) => onEvaluationChange(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
            >
                <option value="">Selecciona una evaluacion</option>
                {evaluations.map((evaluation) => (
                    <option key={evaluation.id} value={evaluation.id}>
                        {evaluation.name ?? "Evaluacion sin nombre"}
                    </option>
                ))}
            </select>
        </div>

        <div>
            <label className="text-xs font-semibold uppercase text-gray-400">
                Estudiante
            </label>
            <select
                value={selectedEnrollmentId}
                onChange={(event) => onEnrollmentChange(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
            >
                <option value="">Selecciona un estudiante</option>
                {enrollments.map((enrollment) => (
                    <option key={enrollment.id} value={enrollment.id}>
                        {getStudentOptionLabel(enrollment)}
                    </option>
                ))}
            </select>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Identificacion</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
                {getStudentIdentification(selectedEnrollment)}
            </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Rubrica</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
                {rubricTitle}
            </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Estado</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
                {existingGrade?.status ?? "Sin guardar"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
                Nota actual: {getGradeScore(existingGrade).toFixed(2)}
            </p>
        </div>
    </aside>
);
