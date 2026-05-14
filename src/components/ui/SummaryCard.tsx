// src/components/common/SummaryCard.tsx

interface SummaryItem {
    label: string;
    value: string;
    secondaryValue?: string;
}

interface SummaryCardProps {

    /**
     * Título de la card
     */
    title: string;

    /**
     * Elementos a renderizar
     */
    items: SummaryItem[];

    /**
     * Mensaje cuando no existen datos
     */
    emptyMessage?: string;

    /**
     * Determina si existen datos
     */
    hasData: boolean;
}

/**
 * Card reutilizable de resumen.
 *
 * IMPORTANTE:
 * Esta componente nace de la necesidad
 * de reutilizar el resumen usado en CU-05.
 *
 * Ahora:
 * - CU-05
 * - CU-09
 *
 * compartirán EXACTAMENTE la misma card.
 *
 * Esto respeta:
 * - DRY
 * - SOLID
 * - reutilización real
 *
 * Responsabilidad:
 * - Renderizar información resumida.
 *
 * NO:
 * - consulta APIs
 * - maneja lógica negocio
 * - transforma datos
 */
const SummaryCard = ({
    title,
    items,
    emptyMessage = "No existe información disponible.",
    hasData
}: SummaryCardProps) => {

    return (

        <div
            className="
                bg-white
                border border-gray-200
                rounded-2xl
                p-6
                sticky top-6
            "
        >

            {/* ================= HEADER ================= */}

            <h2
                className="
                    text-lg
                    font-semibold
                    mb-6
                "
            >
                {title}
            </h2>

            {/* ================= EMPTY STATE ================= */}

            {
                !hasData && (

                    <div
                        className="
                            text-sm
                            text-gray-500
                        "
                    >
                        {emptyMessage}
                    </div>
                )
            }

            {/* ================= CONTENT ================= */}

            {
                hasData && (

                    <div
                        className="
                            flex flex-col
                            gap-5
                        "
                    >

                        {
                            items.map((item) => (

                                <div key={item.label}>

                                    {/* Label */}
                                    <p
                                        className="
                                            text-xs
                                            uppercase
                                            text-gray-400
                                            mb-1
                                        "
                                    >
                                        {item.label}
                                    </p>

                                    {/* Valor principal */}
                                    <p
                                        className="
                                            font-medium
                                            text-gray-900
                                        "
                                    >
                                        {item.value}
                                    </p>

                                    {/* Valor secundario opcional */}
                                    {
                                        item.secondaryValue && (

                                            <span
                                                className="
                                                    text-sm
                                                    text-gray-500
                                                "
                                            >
                                                {item.secondaryValue}
                                            </span>
                                        )
                                    }

                                </div>
                            ))
                        }

                    </div>
                )
            }

        </div>
    );
};

export default SummaryCard;