import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { CriteriaRow } from "../../hooks/useRubricForm";
import type { Column } from "../../models/Column";

/**
 * CriteriaEditor — tabla inline de criterios ponderados.
 *
 * FIX CU-08:
 *  - Refactorizado con tabla custom que sigue el mismo patrón visual de
 *    GenericTable (clases, zebra-striping, dark mode) pero con inputs inline
 *    y el botón de eliminar mejorado (rojo, con texto, no solo ícono).
 *  - Se mantiene SRP: solo renderiza/edita, no conoce la API.
 *
 * ¿Por qué no usar GenericTable directamente?
 *  GenericTable asigna keys por rowIndex (no por id), lo que causaría
 *  re-renders inestables en inputs controlados. La tabla interna replica
 *  la misma UI pero usa row.id como key, garantizando estabilidad.
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

const columns: Column<CriteriaRow>[] = [
    { key: "name",        label: "Nombre *"    },
    { key: "description", label: "Descripción" },
    { key: "weight",      label: "Peso %"      },
];

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

            {/* ── Encabezado de sección ── */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
                    Criterios de evaluación
                </h3>
                <button
                    type="button"
                    onClick={onAdd}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                    <Plus size={15} />
                    Agregar criterio
                </button>
            </div>

            {/* ── Tabla de criterios ── */}
            {rows.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-meta-4 text-gray-500 dark:text-bodydark2 uppercase text-xs">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key as string}
                                        className="px-4 py-2.5 text-left font-semibold tracking-wide"
                                    >
                                        {col.label}
                                    </th>
                                ))}
                                {/* Columna acción — ancho fijo para el botón */}
                                <th className="px-4 py-2.5 text-left font-semibold tracking-wide w-36">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr
                                    key={row.id}
                                    className={`border-t border-stroke dark:border-strokedark ${
                                        idx % 2 === 0
                                            ? "bg-white dark:bg-boxdark"
                                            : "bg-gray-50 dark:bg-meta-4"
                                    }`}
                                >
                                    {/* Nombre */}
                                    <td className="px-4 py-2" style={{ minWidth: 160 }}>
                                        <input
                                            type="text"
                                            value={row.name}
                                            placeholder="Ej: Argumentación"
                                            onChange={(e) =>
                                                onUpdate(row.id, "name", e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </td>

                                    {/* Descripción */}
                                    <td className="px-4 py-2" style={{ minWidth: 220 }}>
                                        <input
                                            type="text"
                                            value={row.description}
                                            placeholder="Describe qué se evalúa..."
                                            onChange={(e) =>
                                                onUpdate(row.id, "description", e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </td>

                                    {/* Peso % */}
                                    <td className="px-4 py-2" style={{ width: 100 }}>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={row.weight === 0 ? "" : row.weight}
                                            placeholder="0"
                                            onChange={(e) =>
                                                onUpdate(row.id, "weight", Number(e.target.value))
                                            }
                                            className={inputClass}
                                        />
                                    </td>

                                    {/* ── Botón eliminar mejorado ── */}
                                    <td className="px-4 py-2">
                                        <button
                                            type="button"
                                            onClick={() => onRemove(row.id)}
                                            title="Eliminar este criterio"
                                            className="
                                                inline-flex items-center gap-1.5
                                                h-9 px-3 rounded-lg
                                                border border-red-200 dark:border-red-800
                                                bg-red-50 dark:bg-red-900/20
                                                text-red-600 dark:text-red-400
                                                text-xs font-medium
                                                hover:bg-red-100 hover:border-red-300
                                                dark:hover:bg-red-900/40 dark:hover:border-red-700
                                                transition-colors
                                            "
                                        >
                                            <Trash2 size={13} />
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-400 italic text-center py-6 border border-dashed border-gray-200 dark:border-strokedark rounded-xl">
                    No hay criterios. Haz clic en &ldquo;Agregar criterio&rdquo; para comenzar.
                </p>
            )}

            {/* ── Indicador suma de pesos ── */}
            {rows.length > 0 && (
                <div
                    className={`flex items-center gap-2 text-sm font-medium ${
                        weightsValid ? "text-green-600" : "text-red-500"
                    }`}
                >
                    <span
                        className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
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