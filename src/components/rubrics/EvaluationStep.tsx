import type { ChangeEvent } from "react";
import type { EvaluationOption } from "../../models/rubric/AssociateRubricTypes";

interface Props {
    evaluations: EvaluationOption[];
    selectedId: string;
    onChange: (value: string) => void;
}

export default function EvaluationStep({ evaluations, selectedId, onChange }: Props) {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) =>
        onChange(e.target.value);

    return (
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
            <label className="mb-2 block text-sm font-semibold text-blue-900">
                Paso 1: Seleccione la evaluación
            </label>

            <select
                onChange={handleChange}
                value={selectedId}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-primary"
            >
                <option value="">-- Seleccionar Evaluación --</option>

                {evaluations.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.weight}%)
                    </option>
                ))}
            </select>
        </div>
    );
}