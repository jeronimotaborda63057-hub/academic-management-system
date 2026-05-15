import React from 'react';
import { AlertTriangle, CheckCircle, Info, Lock } from 'lucide-react';
import type { GroupSummary } from '../../models/FinalGrade';

interface FinalGradeSummaryPanelProps {
    summary: GroupSummary;
    semesterIsActive: boolean;
    isConfirmed: boolean;
    // Acepta función sync o async (downloadReport retorna Promise<void>)
    onPreviewReport: () => void | Promise<void>;
}

// Panel lateral derecho: resumen del consolidado, estado del semestre e información importante
const FinalGradeSummaryPanel: React.FC<FinalGradeSummaryPanelProps> = ({
    summary,
    semesterIsActive,
    isConfirmed,
    onPreviewReport,
}) => {
    return (
        <div className="flex flex-col gap-5">

            {/* ─── Resumen del consolidado ─── */}
            <div className="bg-white dark:bg-boxdark rounded-xl shadow p-5">
                <h3 className="text-base font-semibold text-black dark:text-white mb-4">
                    Resumen del consolidado
                </h3>

                <div className="flex flex-col gap-2 text-sm">
                    {/* Estudiantes con nota completa */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">
                            Estudiantes con nota completa:
                        </span>
                        <span className="font-bold text-success">
                            {summary.students_with_complete_grade}
                        </span>
                    </div>

                    {/* Estudiantes con nota parcial (excepción E1) */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">
                            Estudiantes con nota parcial:
                        </span>
                        <span className="font-bold text-warning">
                            {summary.students_with_partial_grade}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">
                            Total de estudiantes:
                        </span>
                        <span className="font-bold text-black dark:text-white">
                            {summary.total_students}
                        </span>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700 my-1" />

                    {/* Promedios y extremos */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Promedio del grupo:</span>
                        <span className="font-bold text-primary">{summary.group_average.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Nota más alta:</span>
                        <span className="font-semibold text-black dark:text-white">{summary.highest_grade.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Nota más baja:</span>
                        <span className="font-semibold text-black dark:text-white">{summary.lowest_grade.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* ─── Estado del semestre (excepción E2) ─── */}
            <div className="bg-white dark:bg-boxdark rounded-xl shadow p-5">
                <h3 className="text-base font-semibold text-black dark:text-white mb-3">
                    Estado del semestre
                </h3>

                {semesterIsActive ? (
                    <div className="flex items-start gap-2 text-success">
                        <CheckCircle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-sm">Semestre activo</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                El semestre está activo.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-2 text-danger">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-sm">Semestre inactivo</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                No se puede registrar la nota final. Contacte al administrador.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Información importante (postcondiciones CU-12) ─── */}
            <div className="bg-white dark:bg-boxdark rounded-xl shadow p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Info size={16} className="text-warning" />
                    <h3 className="text-base font-semibold text-black dark:text-white">Importante</h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Al confirmar el registro oficial:
                </p>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                    <li>Las notas quedarán bloqueadas.</li>
                    <li>Solo el administrador podrá desbloquearlas.</li>
                    <li>Se generará el reporte del grupo.</li>
                </ul>
            </div>

            {/* ─── Reporte (se habilita cuando el registro está confirmado) ─── */}
            <div className="bg-white dark:bg-boxdark rounded-xl shadow p-5">
                <h3 className="text-base font-semibold text-black dark:text-white mb-2">Reporte</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Al confirmar, se generará un reporte descargable con las notas finales.
                </p>
                <button
                    onClick={onPreviewReport}
                    disabled={!isConfirmed}
                    className={`
                        w-full flex items-center justify-center gap-2 px-4 py-2
                        rounded-lg border text-sm font-medium transition-colors
                        ${isConfirmed
                            ? 'border-primary text-primary hover:bg-primary/10 cursor-pointer'
                            : 'border-gray-300 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {isConfirmed && <Lock size={14} />}
                    {isConfirmed ? 'Descargar reporte' : 'Vista previa del reporte'}
                </button>
            </div>

        </div>
    );
};

export default FinalGradeSummaryPanel;