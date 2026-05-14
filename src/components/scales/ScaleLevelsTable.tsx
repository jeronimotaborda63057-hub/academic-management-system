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
     * Callback crear
     */
    onCreate: (
        data: CreateScaleDTO
    ) => Promise<Scale | null>;

    /**
     * Callback actualizar
     */
    onUpdate: (
        id: string,
        data: UpdateScaleDTO
    ) => Promise<Scale | null>;

    /**
     * Callback eliminar
     */
    onDelete: (
        id: string
    ) => Promise<void>;
}

/**
 * Tabla de definición de niveles.
 *
 * IMPORTANTE:
 * Esta versión reutiliza GenericTable
 * para mantener consistencia visual
 * en TODO el proyecto.
 *
 * Esto respeta:
 * - DRY
 * - Open/Closed
 * - reutilización arquitectónica
 *
 * Responsabilidad:
 * - Configurar columnas
 * - Configurar acciones
 * - Transformar eventos
 *
 * NO:
 * - renderiza tablas manualmente
 * - consume APIs
 * - maneja persistencia
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
     * Manejar acciones tabla
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
         * Eliminar nivel
         */
        if (action === "delete") {

            await onDelete(scale.id);
        }
    };

    /**
     * Columnas reutilizando GenericTable
     */
    const columns: Column<Scale>[] = [

        /**
         * Columna nivel
         */
        {
            key: "name",

            label: "Nivel",

            render: (_, scale) => (

                <input
                    type="text"
                    defaultValue={scale.name}
                    disabled={saving}
                    onBlur={(event) => {

                        /**
                         * Validación defensiva
                         */
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
         * Columna descripción
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

                        /**
                         * Validación defensiva
                         */
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
         * Columna valor
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

                        /**
                         * Validación defensiva
                         */
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
     * Acciones reutilizando GenericTable
     */
    const actions: Action[] = [

        /**
         * Acción principal
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
         * Acción eliminar
         */
        {
            name: "delete",
            label: "Eliminar",

            variant: "danger",

            icon: (
                <Trash2
                    size={16}
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

                {/* Botón crear */}
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

            {/* ================= EMPTY STATE ================= */}

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
                        onAction={handleTableAction}
                    />
                )
            }

        </div>
    );
};