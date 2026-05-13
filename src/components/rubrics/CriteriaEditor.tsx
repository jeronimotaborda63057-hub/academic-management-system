import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { CriteriaRow } from "../../hooks/useRubricForm";

/**
 * CriteriaEditor — componente de UI para la tabla de criterios.
 *
 * Principio SOLID aplicado:
 *  - SRP: solo renderiza y edita la lista de criterios.
 *       No sabe nada de API ni de la rúbrica padre.
 *  - ISP: recibe solo las props que necesita (no el estado completo del form).
 */

interface CriteriaEditorProps {
    rows: CriteriaRow[];
    totalWeight: number;
    weightsValid: boolean;
    onAdd: () => void;
    onUpdate: (id: string, field: keyof CriteriaRow, value: string | number) => void;
    onRemove: (id: string) => void;
}

const inputClass =
    "h-9 px-3 rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors w-full";

const CriteriaEditor: React.FC<CriteriaEditorProps> = ({
    rows,
    totalWeight,
    weightsValid,
    onAdd,
    onUpdate,
    onRemove,
}) => {
    return (
        <div className="flex flex-col gap-3">

            {/* Encabezado de sección */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
                    Criterios de evaluación
                </h3>
                <button
                    type="button"
                    onClick={onAdd}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                    <Plus size={15} />
                    Agregar criterio
                </button>
            </div>

            {/* Tabla de criterios */}
            {rows.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-stroke dark:border-strokedark">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-meta-4 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-2 text-left w-1/4">Nombre *</th>
                                <th className="px-4 py-2 text-left">Descripción</th>
                                <th className="px-4 py-2 text-left w-28">Peso % *</th>
                                <th className="px-4 py-2 w-12" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.id} className={idx % 2 === 0 ? "bg-white dark:bg-boxdark" : "bg-gray-50 dark:bg-meta-4"}>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={row.name}
                                            placeholder="Ej: Argumentación"
                                            onChange={(e) => onUpdate(row.id, "name", e.target.value)}
                                            className={inputClass}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={row.description}
                                            placeholder="Describe qué se evalúa..."
                                            onChange={(e) => onUpdate(row.id, "description", e.target.value)}
                                            className={inputClass}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={row.weight === 0 ? "" : row.weight}
                                            placeholder="0"
                                            onChange={(e) => onUpdate(row.id, "weight", Number(e.target.value))}
                                            className={inputClass}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => onRemove(row.id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                            title="Eliminar criterio"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {rows.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-4 border border-dashed border-gray-200 rounded-xl">
                    No hay criterios aún. Haz clic en "Agregar criterio" para comenzar.
                </p>
            )}

            {/* Indicador de suma de pesos */}
            {rows.length > 0 && (
                <div className={`flex items-center gap-2 text-sm font-medium ${
                    weightsValid ? "text-green-600" : "text-red-500"
                }`}>
                    <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                            weightsValid ? "bg-green-500" : "bg-red-500"
                        }`}
                    />
                    Total de pesos: {totalWeight}%
                    {!weightsValid && (
                        <span className="text-xs font-normal text-red-400 ml-1">
                            — deben sumar exactamente 100%
                        </span>
                    )}
                    {weightsValid && totalWeight === 100 && (
                        <span className="text-xs font-normal text-green-500 ml-1">✓</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default CriteriaEditor;