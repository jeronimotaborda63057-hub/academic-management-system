import {
    Pencil,
    Plus,
    Trash2
} from "lucide-react";

import GenericTable from "../common/GenericTable";

import type { Action } from "../../models/Action";
import type { Column } from "../../models/Column";

import type {
    CreateScaleDTO,
    Scale,
    UpdateScaleDTO
} from "../../models/Scale";

/**
 * Props componente
 */
interface ScaleLevelsTableProps {

    /**
     * Lista de niveles
     */
    scales: Scale[];

    /**
     * Estado loading
     */
    loading?: boolean;

    /**
     * Estado saving
     */
    saving?: boolean;

    /**
     * Crear nivel
     */
    onCreate: (
        data: CreateScaleDTO
    ) => Promise<Scale | null>;

    /**
     * Actualizar nivel
     */
    onUpdate: (
        id: string,
        data: UpdateScaleDTO
    ) => Promise<Scale | null>;

    /**
     * Eliminar nivel
     */
    onDelete: (
        id: string
    ) => Promise<void>;
}

/**
 * Tabla definición escalas.
 *
 * Responsabilidades:
 * - renderizar niveles
 * - emitir eventos
 * - configurar GenericTable
 *
 * NO:
 * - lógica negocio
 * - confirmaciones
 * - side effects
 * - persistencia
 *
 * Respeta:
 * - SRP
 * - Open/Closed
 * - DRY
 * - DIP
 */
export const ScaleLevelsTable = ({
    scales,

    loading = false,
    saving = false,

    onCreate,
    onUpdate,
    onDelete
}: ScaleLevelsTableProps) => {

    /**
     * Crear nuevo nivel
     */
    const handleAddLevel = async () => {

        const newScale: CreateScaleDTO = {
            criterion_id: scales[0]?.criterion_id || "",
            name: "Nuevo nivel",
            description: "",
            value: 0
        };

        await onCreate(newScale);
    };

    /**
     * Acciones tabla
     */
    const handleTableAction = async (
        action: string,
        scale: Scale
    ) => {

        /**
         * Validación defensiva
         */
        if (!scale.id) {
            return;
        }

        /**
         * Editar
         *
         * La edición ya es inline.
         */
        if (action === "edit") {
            return;
        }

        /**
         * Eliminar
         *
         * La confirmación se maneja
         * desde la página contenedora.
         */
        if (action === "delete") {

            await onDelete(scale.id);
        }
    };

    /**
     * Columnas tabla
     */
    const columns: Column<Scale>[] = [

        /**
         * Lista niveles
         */
        {
            key: "name",

            label: "Lista de niveles",

            render: (_, scale) => (

                <input
                    type="text"
                    defaultValue={scale.name}
                    disabled={saving}
                    onBlur={(event) => {

                        if (!scale.id) {
                            return;
                        }

                        onUpdate(scale.id, {
                            name: event.target.value
                        });
                    }}
                    className="
                        w-full
                        border border-gray-200
                        rounded-xl
                        px-3 py-2
                        text-sm
                        outline-none
                        focus:ring-2
                        focus:ring-primary
                    "
                />
            )
        },

        /**
         * Descripción
         */
        {
            key: "description",

            label: "Descripción",

            render: (_, scale) => (

                <textarea
                    rows={2}
                    defaultValue={scale.description}
                    disabled={saving}
                    onBlur={(event) => {

                        if (!scale.id) {
                            return;
                        }

                        onUpdate(scale.id, {
                            description:
                                event.target.value
                        });
                    }}
                    className="
                        w-full
                        border border-gray-200
                        rounded-xl
                        px-3 py-2
                        text-sm
                        resize-none
                        outline-none
                        focus:ring-2
                        focus:ring-primary
                    "
                />
            )
        },

        /**
         * Valor
         */
        {
            key: "value",

            label: "Valor",

            render: (_, scale) => (

                <input
                    type="number"
                    defaultValue={scale.value}
                    disabled={saving}
                    onBlur={(event) => {

                        if (!scale.id) {
                            return;
                        }

                        onUpdate(scale.id, {
                            value: Number(
                                event.target.value
                            )
                        });
                    }}
                    className="
                        w-full
                        border border-gray-200
                        rounded-xl
                        px-3 py-2
                        text-sm
                        outline-none
                        focus:ring-2
                        focus:ring-primary
                    "
                />
            )
        }
    ];

    /**
     * Acciones tabla
     */
    const actions: Action[] = [

        /**
         * Editar
         */
        {
            name: "edit",
            label: "Editar",

            primary: true,

            icon: (
                <Pencil
                    size={18}
                    className="text-gray-600"
                />
            )
        },

        /**
         * Eliminar
         */
        {
            name: "delete",
            label: "Eliminar",
            primary: true,
            variant: "danger",

            icon: (
                <Trash2
                    size={18}
                    className="text-red-600"
                />
            )
        }
    ];

    return (

        <div
            className="
                flex flex-col
                gap-4
            "
        >

            {/* ================= HEADER ================= */}

            <div
                className="
                    flex items-center
                    justify-between
                "
            >

                <div>

                    <h2
                        className="
                            text-lg
                            font-semibold
                            text-gray-800
                        "
                    >
                        Lista de niveles
                    </h2>

                    <p
                        className="
                            text-sm
                            text-gray-500
                        "
                    >
                        Define los niveles
                        de desempeño del criterio
                    </p>

                </div>

                {/* Crear nivel */}
                <button
                    onClick={handleAddLevel}
                    disabled={saving}
                    className="
                        flex items-center gap-2
                        px-4 py-2
                        rounded-xl
                        bg-primary
                        text-white
                        hover:opacity-90
                        transition-all
                    "
                >

                    <Plus size={18} />

                    Agregar nivel

                </button>

            </div>

            {/* ================= EMPTY ================= */}

            {
                !loading &&
                scales.length === 0 && (

                    <div
                        className="
                            bg-white
                            border border-gray-200
                            rounded-xl
                            p-10
                            text-center
                            text-gray-500
                            text-sm
                        "
                    >
                        No existen niveles registrados.
                    </div>
                )
            }

            {/* ================= LOADING ================= */}

            {
                loading && (

                    <div
                        className="
                            bg-white
                            border border-gray-200
                            rounded-xl
                            p-10
                            text-center
                            text-gray-500
                            text-sm
                        "
                    >
                        Cargando niveles...
                    </div>
                )
            }

            {/* ================= TABLA ================= */}

            {
                !loading &&
                scales.length > 0 && (

                    <GenericTable<Scale>
                        data={scales}
                        columns={columns}
                        actions={actions}
                        hideMenuButton
                        onAction={handleTableAction}
                    />
                )
            }

        </div>
    );
};