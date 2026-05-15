import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
// StudentFinalGradeRow y StudentEvalGrade son modelos propios del CU-12
import type { StudentFinalGradeRow, StudentEvalGrade } from '../../models/FinalGrade';
// Evaluation viene del modelo original del proyecto
import type { Evaluation } from '../../models/Evaluation';

interface FinalGradeTableProps {
    evaluations: Evaluation[];   // Lista de evaluaciones del grupo (columnas dinámicas)
    rows: StudentFinalGradeRow[]; // Una fila por inscripción activa
    totalWeight: number;
}

// Badge de estado para cada estudiante
const StatusBadge: React.FC<{ isComplete: boolean }> = ({ isComplete }) => {
    if (isComplete) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                <CheckCircle size={12} />
                Completa
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            <AlertTriangle size={12} />
            Parcial
        </span>
    );
};

// Tabla principal del consolidado (paso 1 del flujo CU-12)
// Renderiza dinámicamente una columna por cada Evaluación del Grupo
const FinalGradeTable: React.FC<FinalGradeTableProps> = ({
    evaluations,
    rows,
    totalWeight,
}) => {

    // Calcula el promedio de una evaluación entre todos los estudiantes
    const getEvalAverage = (evalId: string): number => {
        const valid = rows.filter(r => {
            const grade = r.grades.find(g => g.evaluation_id === evalId);
            return grade && grade.raw_score > 0;
        });
        if (!valid.length) return 0;
        const sum = valid.reduce((acc, r) => {
            const grade = r.grades.find(g => g.evaluation_id === evalId);
            return acc + (grade?.raw_score ?? 0);
        }, 0);
        return sum / valid.length;
    };

    const groupFinalAvg = rows.reduce((acc, r) => acc + r.final_grade, 0) / (rows.length || 1);

    return (
        <div className="bg-white dark:bg-boxdark rounded-xl shadow overflow-hidden">

            {/* ─── Encabezado de la tabla ─── */}
            <div className="px-5 py-4 border-b border-stroke dark:border-strokedark">
                <h3 className="text-base font-semibold text-black dark:text-white">
                    Consolidado de nota final por estudiante
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    La nota final es la suma ponderada de todas las evaluaciones del grupo.
                </p>
            </div>

            {/* ─── Tabla con columnas dinámicas por evaluación ─── */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">

                    {/* THEAD: columnas fijas + una por evaluación */}
                    <thead className="bg-gray-50 dark:bg-meta-4 text-xs uppercase text-gray-500 dark:text-gray-300">
                        <tr>
                            <th className="px-4 py-3 text-left w-8">#</th>
                            <th className="px-4 py-3 text-left">Estudiante</th>
                            <th className="px-4 py-3 text-left">Inscripción</th>

                            {/* Una columna por cada evaluación, con su nombre y peso */}
                            {evaluations.map(ev => (
                                <th key={ev.id ?? ''} className="px-4 py-3 text-center min-w-[110px]">
                                    <div className="font-semibold">{ev.name}</div>
                                    <div className="text-gray-400 font-normal normal-case">
                                        {ev.weight} %
                                    </div>
                                </th>
                            ))}

                            <th className="px-4 py-3 text-center font-bold text-primary">
                                Nota final<br />
                                <span className="text-gray-400 font-normal">(100 %)</span>
                            </th>
                            <th className="px-4 py-3 text-left">Estado</th>
                            <th className="px-4 py-3 text-left">Observaciones</th>
                        </tr>
                    </thead>

                    {/* TBODY: una fila por inscripción activa */}
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr
                                key={row.registration_id}
                                className="border-t border-stroke dark:border-strokedark hover:bg-gray-50/50 dark:hover:bg-meta-4/20 transition-colors"
                            >
                                {/* Número de fila */}
                                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>

                                {/* Nombre e identificación del estudiante */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {/* Avatar con iniciales */}
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                            {row.student_name
                                                .split(' ')
                                                .slice(0, 2)
                                                .map(n => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-black dark:text-white">
                                                {row.student_name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {row.student_identification}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Código de inscripción */}
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {row.inscription_code}
                                </td>

                                {/* Notas por evaluación: nota cruda + ponderada */}
                                {evaluations.map(ev => {
                                    const grade: StudentEvalGrade | undefined = row.grades.find(
                                        g => g.evaluation_id === (ev.id ?? '')
                                    );
                                    return (
                                        <td key={ev.id ?? ''} className="px-4 py-3 text-center">
                                            {grade ? (
                                                <div>
                                                    <p className="font-medium text-black dark:text-white">
                                                        {grade.raw_score.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {grade.weighted_score.toFixed(2)}
                                                    </p>
                                                </div>
                                            ) : (
                                                // Sin nota registrada: excepción E1
                                                <span className="text-xs text-warning flex items-center justify-center gap-1">
                                                    <AlertTriangle size={12} />
                                                    Sin nota
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}

                                {/* Nota final ponderada */}
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-lg font-bold ${
                                        row.is_complete ? 'text-primary' : 'text-warning'
                                    }`}>
                                        {row.final_grade.toFixed(2)}
                                    </span>
                                </td>

                                {/* Badge de estado completa/parcial */}
                                <td className="px-4 py-3">
                                    <StatusBadge isComplete={row.is_complete} />
                                </td>

                                {/* Observaciones (campo Nota.observaciones para notas parciales) */}
                                <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px]">
                                    {row.observations
                                        ? <span className="italic">{row.observations}</span>
                                        : <span className="text-gray-300">—</span>
                                    }
                                </td>
                            </tr>
                        ))}

                        {/* Fila de promedios del grupo */}
                        <tr className="border-t-2 border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4 font-semibold">
                            <td colSpan={3} className="px-4 py-3 text-black dark:text-white">
                                Promedio del grupo
                            </td>
                            {evaluations.map(ev => (
                                <td key={ev.id ?? ''} className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                                    {getEvalAverage(ev.id ?? '').toFixed(2)}
                                </td>
                            ))}
                            <td className="px-4 py-3 text-center text-primary font-bold text-lg">
                                {groupFinalAvg.toFixed(2)}
                            </td>
                            <td colSpan={2} />
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ─── Fórmula de cálculo (nota informativa del mockup) ─── */}
            <div className="px-5 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 flex items-start gap-2">
                <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Nota:</strong> La nota final se calcula: Nota final = {
                        evaluations.map((ev, i) => (
                            <span key={ev.id ?? ''}>
                                ({ev.name} × {ev.weight}%){i < evaluations.length - 1 ? ' + ' : ''}
                            </span>
                        ))
                    }
                </p>
            </div>
        </div>
    );
};

export default FinalGradeTable;