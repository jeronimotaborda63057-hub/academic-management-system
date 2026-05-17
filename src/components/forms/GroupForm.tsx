import { Loader2 } from "lucide-react";

import type { Semester } from "../../models/Semester";
import type { Subject } from "../../models/Subject";
import type { Teacher } from "../../models/Teacher";

type Mode = "create" | "edit";

export interface GroupFormValues {
    name: string;
    group_code: string;
    capacity: number;
    semester_id: string;
    subject_id: string;
    teacher_id: string;
}

export interface GroupFormProps {
    mode: Mode;
    values: GroupFormValues;
    semesters: Semester[];
    subjects: Subject[];
    teachers: Teacher[];
    isSubmitting: boolean;
    onChange: (field: keyof GroupFormValues, value: string | number) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

const GroupForm = ({
    mode,
    values,
    semesters,
    subjects,
    teachers,
    isSubmitting,
    onChange,
    onSubmit,
    onCancel,
}: GroupFormProps) => (
    <div className="flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-2">
                {mode === "create" ? "Crear grupo" : "Editar grupo"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                {mode === "create"
                    ? "Completa los datos para crear un nuevo grupo."
                    : "Actualiza la informacion del grupo."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Nombre</label>
                    <input
                        value={values.name}
                        onChange={(event) => onChange("name", event.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                        placeholder="Grupo A"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Codigo</label>
                    <input
                        value={values.group_code}
                        onChange={(event) => onChange("group_code", event.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                        placeholder="G-01"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Capacidad</label>
                    <input
                        type="number"
                        value={values.capacity}
                        onChange={(event) => onChange("capacity", Number(event.target.value))}
                        className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                        min={1}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Semestre</label>
                    <select
                        value={values.semester_id}
                        onChange={(event) => onChange("semester_id", event.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                    >
                        <option value="">Selecciona un semestre</option>
                        {semesters.map((semester) => (
                            <option key={semester.id} value={semester.id}>
                                {semester.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Asignatura</label>
                    <select
                        value={values.subject_id}
                        onChange={(event) => onChange("subject_id", event.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                    >
                        <option value="">Selecciona una asignatura</option>
                        {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code ?? ""})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Docente</label>
                    <select
                        value={values.teacher_id}
                        onChange={(event) => onChange("teacher_id", event.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                    >
                        <option value="">Selecciona un docente</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.first_name} {teacher.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
                <button
                    onClick={onCancel}
                    type="button"
                    className="border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-xl transition-all"
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>

                <button
                    onClick={onSubmit}
                    type="button"
                    className={`px-6 py-3 rounded-xl text-white transition-all inline-flex items-center gap-2 ${
                        isSubmitting
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-green-700 hover:bg-green-800"
                    }`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>Guardar</>
                    )}
                </button>
            </div>
        </div>
    </div>
);

export default GroupForm;
