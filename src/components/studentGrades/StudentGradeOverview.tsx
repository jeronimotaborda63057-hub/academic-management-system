import { CalendarDays } from "lucide-react";

import type { StudentGradeContext } from "../../models/StudenGradeContext";
import {
    formatGradeDate,
    formatGradeScore,
    getGradeFinalScore,
} from "../../hooks/studentGradeDisplay";

interface StudentGradeOverviewProps {
    context: StudentGradeContext;
}

export const StudentGradeOverview = ({ context }: StudentGradeOverviewProps) => (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                    <CalendarDays size={22} />
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500">Evaluacion</p>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {context.evaluation?.name ?? "Evaluacion sin nombre"}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>Tipo: Evaluacion</span>
                        <span>Ponderacion: {context.evaluation?.weight ?? 0}%</span>
                        <span>Fecha enviada: {formatGradeDate(context.grade?.updated_at)}</span>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-primary/10 bg-primary/5 px-8 py-4 text-center">
                <p className="text-xs font-semibold text-gray-500">Tu nota final</p>
                <p className="mt-1 text-3xl font-bold text-primary">
                    {formatGradeScore(getGradeFinalScore(context.grade))}
                    <span className="text-lg font-medium text-gray-700"> / 100</span>
                </p>
                <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Enviada
                </span>
            </div>
        </div>
    </section>
);
