import { useState } from "react";

export interface CriteriaRow {
    id: string;
    name: string;
    description: string;
    weight: number;
}

export interface RubricFormState {
    title: string;
    description: string;
}

/**
 * useRubricForm — estado compartido para crear y editar rúbricas.
 *
 * FIX CU-08:
 *  - Se expone `setForm` para inicializar desde datos del servidor en Edit.tsx.
 *  - Se añade `resetCriteria` para cargar criterios asincrónicamente sin
 *    race condition (borradores cargaban vacíos porque el hook se montaba
 *    antes de que llegaran los datos de la API).
 */
export function useRubricForm(initial?: {
    title?: string;
    description?: string;
    criteria?: CriteriaRow[];
}) {
    const [form, setForm] = useState<RubricFormState>({
        title: initial?.title ?? "",
        description: initial?.description ?? "",
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

    /**
     * FIX sincronización: reemplaza los criterios locales con los del servidor.
     * Llamar desde useEffect en Edit después de cargar la rúbrica.
     */
    const resetCriteria = (rows: CriteriaRow[]) => {
        setCriteriaRows(rows);
    };

    const totalWeight = criteriaRows.reduce((sum, c) => sum + Number(c.weight), 0);
    const weightsValid = criteriaRows.length === 0 || totalWeight === 100;

    // Para publicar: título + al menos 1 criterio + todos con nombre + pesos = 100%
    const formValid =
        form.title.trim() !== "" &&
        criteriaRows.length > 0 &&
        criteriaRows.every((c) => c.name.trim() !== "") &&
        weightsValid;

    // Para borrador: solo título obligatorio
    const draftValid = form.title.trim() !== "";

    return {
        form,
        setForm,
        criteriaRows,
        totalWeight,
        weightsValid,
        formValid,
        draftValid,
        handleFormChange,
        addCriteria,
        updateCriteria,
        removeCriteria,
        resetCriteria,
    };
}