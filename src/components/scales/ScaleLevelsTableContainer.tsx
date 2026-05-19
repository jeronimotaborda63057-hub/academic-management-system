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
    error: string | null;
    onCreate: (data: CreateScaleDTO) => Promise<Scale | null>;
    onUpdate: (id: string, data: UpdateScaleDTO) => Promise<Scale | null>;
    onDelete: (id: string) => Promise<void>;
}

export const ScaleLevelsTableContainer = ({
    criterionId,
    allScales,
    scales,
    loading,
    saving,
    error,
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

    const handleConfirmClone = async (scale: Scale) => {
        const dto: CreateScaleDTO = {
            criterion_id: criterionId,
            name: scale.name ?? "",
            description: scale.description ?? "",
            value: scale.value ?? 0,
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
                error={error}
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