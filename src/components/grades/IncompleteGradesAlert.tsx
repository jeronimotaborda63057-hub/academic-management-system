import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IncompleteGradesAlertProps {
    incompleteCount: number;
    semesterIsActive: boolean;
}

// Banners de advertencia del footer (excepciones E1 y E2 del CU-12)
// E1: Algún estudiante no tiene todas las evaluaciones calificadas
// E2: Semestre inactivo → bloquea el registro
const IncompleteGradesAlert: React.FC<IncompleteGradesAlertProps> = ({
    incompleteCount,
    semesterIsActive,
}) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

            {/* ─── Excepción E1: Notas incompletas ─── */}
            {incompleteCount > 0 && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                    <XCircle size={18} className="text-danger shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-danger">
                            Notas incompletas detectadas
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {incompleteCount} estudiante(s) no tienen todas las evaluaciones calificadas.
                            Puede continuar y registrar la nota final parcial agregando observaciones.
                        </p>
                    </div>
                    {/* Flujo alternativo 3a: ir a CU-10 para corregir calificaciones */}
                    <button
                        onClick={() => navigate('/grades/list')}
                        className="shrink-0 px-3 py-1.5 border border-danger text-danger rounded-lg text-xs font-medium hover:bg-danger hover:text-white transition-colors"
                    >
                        Ver detalles
                    </button>
                </div>
            )}

            {/* ─── Excepción E2: Semestre inactivo ─── */}
            {!semesterIsActive && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                    <XCircle size={18} className="text-danger shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-danger">Semestre inactivo</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Si el semestre estuviera inactivo, no se permitiría registrar la nota final.
                            Contacte al administrador.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="shrink-0 px-3 py-1.5 border border-danger text-danger rounded-lg text-xs font-medium hover:bg-danger hover:text-white transition-colors"
                    >
                        Ir al inicio
                    </button>
                </div>
            )}
        </div>
    );
};

export default IncompleteGradesAlert;