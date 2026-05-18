import { useState } from "react";

import { ScaleLevelsTable } from "./ScaleLevelsTable";
import { CloneScaleModal } from "./CloneScaleModal";

import { useClonableScales } from "../../hooks/useClonableScales";

import type {
    CreateScaleDTO,
    Scale,
    UpdateScaleDTO,
} from "../../models/uml/Scale";

interface ScaleLevelsTableContainerProps {
    criterionId: string;
    allScales: Scale[];
    scales: Scale[];
    loading: boolean;
    saving: boolean;
    onCreate: (data: CreateScaleDTO) => Promise<Scale | null>;
    onUpdate: (id: string, data: UpdateScaleDTO) => Promise<Scale | null>;
    onDelete: (id: string) => Promise<void>;
}

/**
 * SRP → orquesta modal + DTO. No renderiza tabla ni filtra escalas.
 * OCP → cambiar lógica del modal no toca ScaleLevelsTable.
 * DIP → depende de abstracciones (hooks, callbacks), no de servicios.
 */
export const ScaleLevelsTableContainer = ({
    criterionId,
    allScales,
    scales,
    loading,
    saving,
    onCreate,
    onUpdate,
    onDelete,
}: ScaleLevelsTableContainerProps) => {

    // ── Visibilidad modal ──────────────────────────────────
    const [showModal, setShowModal] = useState(false);

    // ── Escalas clonables (filtradas) ──────────────────────
    const { clonableScales } = useClonableScales({
        allScales,
        criterionId,
    });

    // ── Handlers ───────────────────────────────────────────

    /**
     * SRP → construye el DTO a partir de la escala seleccionada.
     * ScaleLevelsTable y CloneScaleModal no saben de DTOs.
     */
    const handleConfirmClone = async (scale: Scale) => {

        const dto: CreateScaleDTO = {
            criterion_id: criterionId,
            name: scale.name ?? "",  // ← fallback
            description: scale.description ?? "",  // ← fallback
            value: scale.value ?? 0,   // ← fallback
        };

        await onCreate(dto);
        setShowModal(false);
    };

    const handleCreate = () => {
        const dto: CreateScaleDTO = {
            criterion_id: criterionId,
            name: "Nuevo nivel",
            description: "",
            value: 0,
        };
        return onCreate(dto);
    };

    // ── Render ─────────────────────────────────────────────
    return (
        <>
            <ScaleLevelsTable
                scales={scales}
                loading={loading}
                saving={saving}
                onCreate={handleCreate}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onClone={() => setShowModal(true)}
            />

            <CloneScaleModal
                scales={clonableScales}
                open={showModal}
                onConfirm={handleConfirmClone}
                onCancel={() => setShowModal(false)}
            />
        </>
    );
};