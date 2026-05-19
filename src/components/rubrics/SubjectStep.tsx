import type { ChangeEvent } from "react";
import type { Subject } from "../../models/rubric/AssociateRubricTypes"

interface Props {
    subjects: Subject[];
    selectedSubjectId: string;
    onChange: (subjectId: string) => void;
}

export default function SubjectStep({ subjects, selectedSubjectId, onChange }: Props) {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) =>
        onChange(e.target.value);

    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
                Paso 3: Cambiar asignatura destino
            </label>

            <select
                value={selectedSubjectId}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary"
            >
                <option value="">-- Seleccionar Asignatura --</option>

                {subjects.map((subject) => {
                    const subId =
                        subject.id ??
                        (subject as any).subject_id ??
                        (subject as any).id_subject;

                    return (
                        <option key={subId} value={subId}>
                            {subject.name}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}