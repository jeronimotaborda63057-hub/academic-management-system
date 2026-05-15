import { Plus, Trash2, Copy } from "lucide-react";

import GenericTable from "../ui/GenericTable";
import { useScaleLevelsColumns } from "../hooks/useScaleLevelsColumn";

import type { Action } from "../../models/Action";
import type {
    CreateScaleDTO,
    Scale,
    UpdateScaleDTO,
} from "../../models/Scale";

interface ScaleLevelsTableProps {
    scales:   Scale[];
    loading?: boolean;
    saving?:  boolean;
    onCreate: (data: CreateScaleDTO) => Promise<Scale | null>;
    onUpdate: (id: string, data: UpdateScaleDTO) => Promise<Scale | null>;
    onDelete: (id: string) => Promise<void>;
    onClone:  () => void;    // ← nuevo: solo abre el modal
}

/**
 * SRP → renderiza tabla y emite eventos.
 * ISP → onClone no sabe qué pasa después de abrirse el modal.
 * OCP → extensible sin modificar lógica interna.
 */
export const ScaleLevelsTable = ({
    scales,
    loading  = false,
    saving   = false,
    onCreate,
    onUpdate,
    onDelete,
    onClone,
}: ScaleLevelsTableProps) => {

    const columns = useScaleLevelsColumns({
        saving,
        onUpdate,
    });

    const actions: Action[] = [
        {
            name:    "delete",
            label:   "Eliminar",
            primary: true,
            variant: "danger",
            icon:    <Trash2 size={18} className="text-red-600" />,
        },
    ];

    const handleTableAction = async (action: string, scale: Scale) => {
        if (!scale.id)           return;
        if (action === "edit")   return;
        if (action === "delete") await onDelete(scale.id);
    };

    return (
        <div className="flex flex-col gap-4">

            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between">

                <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Lista de niveles
                    </h2>
                    <p className="text-sm text-gray-500">
                        Define los niveles de desempeño del criterio
                    </p>
                </div>

                <div className="flex items-center gap-2">

                    {/* Reutilizar escala */}
                    <button
                        onClick={onClone}
                        disabled={saving}
                        className="
                            flex items-center gap-2
                            px-4 py-2
                            rounded-xl
                            border border-gray-200
                            text-sm text-gray-600
                            hover:bg-gray-50
                            transition
                            disabled:opacity-60
                        "
                    >
                        <Copy size={16} />
                        Reutilizar escala
                    </button>

                    {/* Agregar nivel */}
                    <button
                        onClick={() => onCreate({
                            criterion_id: scales[0]?.criterion_id ?? "",
                            name:         "Nuevo nivel",
                            description:  "",
                            value:        0,
                        })}
                        disabled={saving}
                        className="
                            flex items-center gap-2
                            px-4 py-2
                            rounded-xl
                            bg-primary text-white
                            hover:opacity-90
                            transition
                            disabled:opacity-60
                        "
                    >
                        <Plus size={18} />
                        Agregar nivel
                    </button>

                </div>

            </div>

            {/* ===== EMPTY ===== */}
            {!loading && scales.length === 0 && (
                <div className="
                    bg-white border border-gray-200 rounded-xl
                    p-10 text-center text-gray-500 text-sm
                ">
                    No existen niveles registrados.
                </div>
            )}

            {/* ===== LOADING ===== */}
            {loading && (
                <div className="
                    bg-white border border-gray-200 rounded-xl
                    p-10 text-center text-gray-500 text-sm
                ">
                    Cargando niveles...
                </div>
            )}

            {/* ===== TABLA ===== */}
            {!loading && scales.length > 0 && (
                <GenericTable<Scale>
                    data={scales}
                    columns={columns}
                    actions={actions}
                    hideMenuButton
                    onAction={handleTableAction}
                />
            )}

        </div>
    );
};