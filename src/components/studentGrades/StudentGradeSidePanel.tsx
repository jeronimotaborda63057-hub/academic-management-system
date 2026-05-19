import { Download, ExternalLink, MessageCircle } from "lucide-react";

import type { StudentGradeContext } from "../../models/interfaces/StudenGradeContext";
import { formatGradeDate } from "../../hooks/studentGradeDisplay";

interface StudentGradeSidePanelProps {
    context: StudentGradeContext;
    onDownloadReport: () => void;
    onViewRubric: () => void;
}

export const StudentGradeSidePanel = ({
    context,
    onDownloadReport,
    onViewRubric,
}: StudentGradeSidePanelProps) => (
    <aside className="space-y-4">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">Información general</h3>
            <dl className="mt-5 space-y-4 text-sm">
                <div className="grid grid-cols-[92px_1fr] gap-3">
                    <dt className="text-gray-500">Asignatura:</dt>
                    <dd className="font-medium text-gray-800">
                        {context.subject?.name ?? "No disponible"}
                    </dd>
                </div>
                <div className="grid grid-cols-[92px_1fr] gap-3">
                    <dt className="text-gray-500">Grupo:</dt>
                    <dd className="font-medium text-gray-800">
                        {context.group?.name ?? context.group?.group_code ?? "No disponible"}
                    </dd>
                </div>
                <div className="grid grid-cols-[92px_1fr] gap-3">
                    <dt className="text-gray-500">Evaluación:</dt>
                    <dd className="font-medium text-gray-800">
                        {context.evaluation?.name ?? "No disponible"}
                    </dd>
                </div>
                <div className="grid grid-cols-[92px_1fr] gap-3">
                    <dt className="text-gray-500">Docente:</dt>
                    <dd className="font-medium text-gray-800">
                        {context.teacher
                            ? `${context.teacher.first_name} ${context.teacher.last_name}`
                            : "No disponible"}
                    </dd>
                </div>
                <div className="grid grid-cols-[92px_1fr] gap-3">
                    <dt className="text-gray-500">Fecha enviada:</dt>
                    <dd className="font-medium text-gray-800">
                        {formatGradeDate(context.grade?.updated_at)}
                    </dd>
                </div>
            </dl>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">Rúbrica utilizada</h3>
            <p className="mt-4 text-sm font-medium text-gray-800">
                {context.rubric?.title ?? "Rubrica sin titulo"}
            </p>
            <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium 
            ${context.rubric?.is_public
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
            >
                {context.rubric?.is_public ? "Pública" : "Privada"}
            </span>
            <button
                type="button"
                onClick={onViewRubric}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 text-sm font-medium text-primary hover:bg-primary/5"
            >
                Ver rubrica completa
                <ExternalLink size={15} />
            </button>
        </section>

        <section className="rounded-lg border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-2 text-blue-700">
                <MessageCircle size={18} />
                <h3 className="text-sm font-semibold">Observaciones del docente</h3>
            </div>
            <p className="mt-3 text-sm text-blue-900">
                {context.grade?.observations || "Sin observaciones generales."}
            </p>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">Acciones</h3>
            <button
                type="button"
                onClick={onDownloadReport}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-primary hover:bg-gray-50"
            >
                <Download size={15} />
                Descargar reporte de desempeno
            </button>
            <p className="mt-4 text-xs text-gray-500">
                Descarga un archivo con el detalle de tu evaluacion.
            </p>
        </section>
    </aside>
);
