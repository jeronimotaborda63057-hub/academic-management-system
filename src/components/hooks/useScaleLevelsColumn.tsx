import type { Column } from "../../models/Column";
import type { UpdateScaleDTO } from "../../models/Scale";
import type { Scale } from "../../models/Scale";

interface UseScaleLevelsColumnsProps {
    saving:   boolean;
    onUpdate: (id: string, data: UpdateScaleDTO) => Promise<Scale | null>;
    // ← criterionId eliminado
}

export const useScaleLevelsColumns = ({
    saving,
    onUpdate,
}: UseScaleLevelsColumnsProps): Column<Scale>[] => [

    {
        key: "name",
        label: "Nombre (etiqueta)",
        render: (_, scale) => (
            <input
                key={scale.id}
                type="text"
                defaultValue={scale.name}
                disabled={saving}
                onBlur={(e) => {
                    if (!scale.id) return;
                    if (e.target.value === scale.name) return;
                    onUpdate(scale.id, { name: e.target.value });
                }}
                className="
                    w-full border border-gray-200
                    rounded-xl px-3 py-2 text-sm
                    outline-none focus:ring-2 focus:ring-primary
                "
            />
        ),
    },

    {
        key: "description",
        label: "Descripción",
        render: (_, scale) => (
            <textarea
                key={scale.id}
                rows={2}
                defaultValue={scale.description}
                disabled={saving}
                onBlur={(e) => {
                    if (!scale.id) return;
                    if (e.target.value === scale.description) return;
                    onUpdate(scale.id, { description: e.target.value });
                }}
                className="
                    w-full border border-gray-200
                    rounded-xl px-3 py-2 text-sm
                    resize-none outline-none
                    focus:ring-2 focus:ring-primary
                "
            />
        ),
    },

    {
        key: "value",
        label: "Valor",
        render: (_, scale) => (
            <input
                key={scale.id}
                type="number"
                defaultValue={scale.value}
                disabled={saving}
                onBlur={(e) => {
                    if (!scale.id) return;
                    const newValue = Number(e.target.value);
                    if (newValue === scale.value) return;
                    onUpdate(scale.id, { value: newValue });
                }}
                className="
                    w-full border border-gray-200
                    rounded-xl px-3 py-2 text-sm
                    outline-none focus:ring-2 focus:ring-primary
                "
            />
        ),
    },
];