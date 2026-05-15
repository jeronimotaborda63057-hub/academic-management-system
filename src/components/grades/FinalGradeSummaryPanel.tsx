import React from 'react';
import { BookOpen } from 'lucide-react';
import type { Group } from '../../models/Group';

interface FinalGradeGroupCardProps {
    group: Group;
    totalStudents: number;
    activeEnrollments: number;
    evaluationsCount: number;
    totalWeight: number;
}

// Tarjeta con información del grupo (parte superior del formulario, como en el mockup)
const FinalGradeGroupCard: React.FC<FinalGradeGroupCardProps> = ({
    group,
    totalStudents,
    activeEnrollments,
    evaluationsCount,
    totalWeight,
}) => {
    return (
        <div className="bg-white dark:bg-boxdark rounded-xl shadow p-5 mb-5 flex items-start gap-4">

            {/* Ícono del grupo */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen size={24} className="text-primary" />
            </div>

            {/* Información del grupo en dos columnas */}
            <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-2 text-sm">

                <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 min-w-[90px]">Grupo:</span>
                    <span className="font-medium text-black dark:text-white">
                        {group.group_code} – {group.name}
                    </span>
                </div>

                <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 min-w-[140px]">
                        Total de estudiantes inscritos:
                    </span>
                    <span className="font-medium text-black dark:text-white">{totalStudents}</span>
                </div>

                <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 min-w-[90px]">Asignatura:</span>
                    <span className="font-medium text-black dark:text-white">
                        {group.subject?.name} ({group.subject?.code ?? ''})
                    </span>
                </div>

                <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 min-w-[140px]">Inscripciones activas:</span>
                    <span className="font-medium text-black dark:text-white">{activeEnrollments}</span>
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-gray-500 dark:text-gray-400 min-w-[90px]">Semestre:</span>
                    <span className="font-medium text-black dark:text-white mr-2">
                        {group.semester?.name ?? '—'}
                    </span>
                    {/* Badge de semestre activo */}
                    {group.semester && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
                            Activo
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 min-w-[140px]">Evaluaciones del grupo:</span>
                    <span className="font-medium text-black dark:text-white">{evaluationsCount}</span>
                </div>

                <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 min-w-[90px]">Docente:</span>
                    <span className="font-medium text-black dark:text-white">
                        {group.teacher
                            ? `${(group.teacher as any).first_name ?? ''} ${(group.teacher as any).last_name ?? ''}`.trim()
                            : '—'}
                    </span>
                </div>

                <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 min-w-[140px]">Ponderación total:</span>
                    <span className="font-medium text-black dark:text-white">{totalWeight} %</span>
                </div>

            </div>
        </div>
    );
};

export default FinalGradeGroupCard;