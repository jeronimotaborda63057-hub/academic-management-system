import { useState } from "react";
import type { Criteria } from "../models/Criteria";

/**
 * useRubricForm — hook que encapsula TODA la lógica del formulario de rúbrica.
 *
 * Principio SOLID aplicado:
 *  - SRP: este hook solo sabe de estado del formulario, no de API ni de UI.
 *  - Los componentes de vista solo consumen este hook; no tienen lógica propia.
 */

// Criterio sin guardar (formulario local)
export interface CriteriaRow {
    id: string;           // id temporal (uuid local) o real si ya existe en BD
    name: string;
    description: string;
    weight: number;
}

export interface RubricFormState {
    title: string;
    description: string;
    subject_id: string;
}

export function useRubricForm(initial?: {
    title?: string;
    description?: string;
    subject_id?: string;
    criteria?: CriteriaRow[];
}) {
    // ── Campos principales ────────────────────────────────
    const [form, setForm] = useState<RubricFormState>({
        title: initial?.title ?? "",
        description: initial?.description ?? "",
        subject_id: initial?.subject_id ?? "",
    });

    // ── Lista de criterios ────────────────────────────────
    const [criteriaRows, setCriteriaRows] = useState<CriteriaRow[]>(
        initial?.criteria ?? []
    );

    // ── Manejo de campos del formulario principal ─────────
    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ── Criterios: agregar ────────────────────────────────
    const addCriteria = () => {
        setCriteriaRows((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                name: "",
                description: "",
                weight: 0,
            },
        ]);
    };

    // ── Criterios: cambiar campo ──────────────────────────
    const updateCriteria = (id: string, field: keyof CriteriaRow, value: string | number) => {
        setCriteriaRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
    };

    // ── Criterios: eliminar ───────────────────────────────
    const removeCriteria = (id: string) => {
        setCriteriaRows((prev) => prev.filter((row) => row.id !== id));
    };

    // ── Validación: pesos deben sumar exactamente 100 ─────
    const totalWeight = criteriaRows.reduce((sum, c) => sum + Number(c.weight), 0);
    const weightsValid = criteriaRows.length === 0 || totalWeight === 100;

    // ── Validación: campos obligatorios ───────────────────
    const formValid =
        form.title.trim() !== "" &&
        form.subject_id !== "" &&
        criteriaRows.every((c) => c.name.trim() !== "") &&
        weightsValid;

    return {
        form,
        criteriaRows,
        totalWeight,
        weightsValid,
        formValid,
        handleFormChange,
        addCriteria,
        updateCriteria,
        removeCriteria,
    };
}