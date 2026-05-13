import { useState } from "react";

/**
 * useRubricForm — hook que encapsula TODA la lógica del formulario de rúbrica.
 *
 * Principio SOLID aplicado:
 *  - SRP: este hook solo sabe de estado del formulario, no de API ni de UI.
 *  - Los componentes de vista solo consumen este hook; no tienen lógica propia.
 */

export interface CriteriaRow {
    id: string;
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
    const [form, setForm] = useState<RubricFormState>({
        title: initial?.title ?? "",
        description: initial?.description ?? "",
        subject_id: initial?.subject_id ?? "",
    });

    const [criteriaRows, setCriteriaRows] = useState<CriteriaRow[]>(
        initial?.criteria ?? []
    );

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const addCriteria = () => {
        setCriteriaRows((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name: "", description: "", weight: 0 },
        ]);
    };

    const updateCriteria = (id: string, field: keyof CriteriaRow, value: string | number) => {
        setCriteriaRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
    };

    const removeCriteria = (id: string) => {
        setCriteriaRows((prev) => prev.filter((row) => row.id !== id));
    };

    // Suma de pesos
    const totalWeight = criteriaRows.reduce((sum, c) => sum + Number(c.weight), 0);

    // Pesos válidos: si hay criterios, deben sumar 100
    const weightsValid = criteriaRows.length === 0 || totalWeight === 100;

    // Publicar: título + al menos 1 criterio con nombre + pesos al 100%
    const formValid =
        form.title.trim() !== "" &&
        criteriaRows.length > 0 &&
        criteriaRows.every((c) => c.name.trim() !== "") &&
        weightsValid;

    // Borrador: solo requiere título
    const draftValid = form.title.trim() !== "";

    return {
        form,
        criteriaRows,
        totalWeight,
        weightsValid,
        formValid,
        draftValid,
        handleFormChange,
        addCriteria,
        updateCriteria,
        removeCriteria,
    };
}