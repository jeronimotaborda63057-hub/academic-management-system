// src/components/scales/CloneScaleModal.tsx

import type { Scale } from "../../models/Scale";

interface CloneScaleModalProps {
    scales:    Scale[];
    open:      boolean;
    onConfirm: (scale: Scale) => void;
    onCancel:  () => void;
}

/**
 * SRP → única responsabilidad: renderizar lista y emitir selección.
 * ISP → recibe solo lo que necesita.
 * DIP → no llama servicios, no construye DTOs, no filtra.
 */
export const CloneScaleModal = ({
    scales,
    open,
    onConfirm,
    onCancel,
}: CloneScaleModalProps) => {

    if (!open) return null;

    return (

        <div
            className="
                fixed inset-0
                bg-black/30
                backdrop-blur-sm
                flex items-center justify-center
                z-50
            "
        >

            <div
                className="
                    bg-white
                    rounded-2xl
                    shadow-xl
                    w-full max-w-md
                    p-6
                    flex flex-col
                    gap-4
                "
            >

                {/* ===== HEADER ===== */}
                <div>
                    <h3 className="text-base font-semibold text-gray-800">
                        Reutilizar escala existente
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Selecciona una escala para clonar sus valores
                        en el criterio actual.
                    </p>
                </div>

                {/* ===== LISTA ===== */}
                <div
                    className="
                        flex flex-col gap-2
                        max-h-72
                        overflow-y-auto
                        pr-1
                    "
                >

                    {scales.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6">
                            No hay escalas disponibles para clonar.
                        </p>
                    )}

                    {scales.map((scale) => (

                        <button
                            key={scale.id}
                            onClick={() => onConfirm(scale)}
                            className="
                                w-full text-left
                                border border-gray-200
                                rounded-xl
                                px-4 py-3
                                hover:border-primary
                                hover:bg-primary/5
                                transition
                                flex flex-col gap-0.5
                            "
                        >

                            <span className="text-sm font-medium text-gray-800">
                                {scale.name}
                            </span>

                            {scale.description && (
                                <span className="text-xs text-gray-500 line-clamp-1">
                                    {scale.description}
                                </span>
                            )}

                            <span className="text-xs text-primary font-medium mt-1">
                                Valor: {scale.value}
                            </span>

                        </button>
                    ))}

                </div>

                {/* ===== ACCIONES ===== */}
                <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="
                            h-9 px-4
                            rounded-xl
                            border border-gray-200
                            text-sm text-gray-600
                            hover:bg-gray-50
                            transition
                        "
                    >
                        Cancelar
                    </button>
                </div>

            </div>

        </div>
    );
};