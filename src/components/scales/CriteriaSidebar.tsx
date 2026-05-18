import type { Criteria } from "../../models/uml/Criteria";

interface CriteriaSidebarProps {

    /**
     * Lista de criterios
     */
    criteria: Criteria[];

    /**
     * Id del criterio seleccionado
     */
    selectedCriterionId?: string;

    /**
     * Callback de selección
     */
    onSelectCriterion: (
        criterion: Criteria
    ) => void;
}

/**
 * Sidebar de criterios.
 *
 * Responsabilidad:
 * - Renderizar listado de criterios
 * - Mostrar criterio activo
 * - Emitir selección
 *
 * NO contiene:
 * - lógica de negocio
 * - llamadas API
 * - validaciones
 * - persistencia
 *
 * Esto respeta:
 * - SRP
 * - DIP
 */
export const CriteriaSidebar = ({
    criteria,
    selectedCriterionId,
    onSelectCriterion
}: CriteriaSidebarProps) => {

    return (

        /**
         * Contenedor principal
         */
        <div
            className="
                bg-white
                rounded-2xl
                border border-gray-200
                shadow-sm
                overflow-hidden
            "
        >

            {/* ================= HEADER ================= */}

            <div
                className="
                    px-5 py-4
                    border-b border-gray-200
                "
            >

                <h2
                    className="
                        text-lg
                        font-semibold
                        text-gray-800
                    "
                >
                    Criterios
                </h2>

                <p
                    className="
                        text-sm
                        text-gray-500
                        mt-1
                    "
                >
                    Selecciona un criterio para definir sus niveles
                </p>

            </div>

            {/* ================= LISTADO ================= */}

            <div
                className="
                    flex flex-col
                "
            >

                {
                    criteria.length === 0 ? (

                        /**
                         * Estado vacío
                         */
                        <div
                            className="
                                px-5 py-10
                                text-center
                                text-sm
                                text-gray-500
                            "
                        >
                            No existen criterios registrados.
                        </div>

                    ) : (

                        /**
                         * Render listado
                         */
                        criteria.map((criterion) => {

                            /**
                             * Validar criterio activo
                             */
                            const isSelected =
                                criterion.id === selectedCriterionId;

                            return (

                                <button
                                    key={criterion.id}
                                    onClick={() =>
                                        onSelectCriterion(criterion)
                                    }
                                    className={`
                                        w-full
                                        text-left
                                        px-5 py-4
                                        border-b border-gray-100
                                        transition-all

                                        ${
                                            isSelected
                                                ? `
                                                    bg-primary/10
                                                    border-l-4
                                                    border-l-primary
                                                `
                                                : `
                                                    hover:bg-gray-50
                                                `
                                        }
                                    `}
                                >

                                    {/* Título criterio */}
                                    <div
                                        className="
                                            flex items-center
                                            justify-between
                                            gap-3
                                        "
                                    >

                                        <h3
                                            className={`
                                                text-sm
                                                font-semibold

                                                ${
                                                    isSelected
                                                        ? "text-primary"
                                                        : "text-gray-800"
                                                }
                                            `}
                                        >
                                            {criterion.name}
                                        </h3>

                                        {/* Peso */}
                                        <span
                                            className="
                                                text-xs
                                                font-medium
                                                text-gray-500
                                            "
                                        >
                                            {criterion.weight}%
                                        </span>

                                    </div>

                                    {/* Descripción */}
                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-2
                                            line-clamp-2
                                        "
                                    >
                                        {criterion.description || "Sin descripción"}
                                    </p>

                                </button>
                            );
                        })
                    )
                }

            </div>

        </div>
    );
};