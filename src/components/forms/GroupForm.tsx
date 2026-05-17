import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import type { Group } from "../../models/Group";
import type { Semester } from "../../models/Semester";
import type { Subject } from "../../models/Subject";
import type { Teacher } from "../../models/Teacher";

import { semesterService } from "../../services/semesterService";
import { subjectService } from "../../services/subjectService";
import { teacherService } from "../../services/teacherService";

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
    initial?: Partial<Group> | null;
    onSubmit: (payload: GroupFormValues) => Promise<void>;
    onCancel: () => void;
}

const asNumber = (value: string): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const normalizeInitial = (initial?: Partial<Group> | null): Partial<GroupFormValues> => {
    if (!initial) return {};

    return {
        name: initial.name ?? "",
        group_code: initial.group_code ?? "",
        capacity: typeof initial.capacity === "number" ? initial.capacity : 0,
        semester_id: initial.semester_id ?? "",
        subject_id: initial.subject_id ?? "",
        teacher_id: initial.teacher_id ?? "",
    };
};

const validate = (values: GroupFormValues): string | null => {
    if (!values.name.trim()) return "El nombre del grupo es obligatorio.";
    if (!values.group_code.trim()) return "El código del grupo es obligatorio.";
    if (!values.capacity || values.capacity <= 0)
        return "La capacidad debe ser un número mayor a 0.";
    if (!values.semester_id) return "Selecciona un semestre.";
    if (!values.subject_id) return "Selecciona una asignatura.";
    if (!values.teacher_id) return "Selecciona un docente.";

    return null;
};

const GroupForm = ({ mode, initial, onSubmit, onCancel }: GroupFormProps) => {
    const normalizedInitial = useMemo(() => normalizeInitial(initial), [initial]);

    const [values, setValues] = useState<GroupFormValues>({
        name: normalizedInitial.name ?? "",
        group_code: normalizedInitial.group_code ?? "",
        capacity: normalizedInitial.capacity ?? 0,
        semester_id: normalizedInitial.semester_id ?? "",
        subject_id: normalizedInitial.subject_id ?? "",
        teacher_id: normalizedInitial.teacher_id ?? "",
    });

    useEffect(() => {
        setValues({
            name: normalizedInitial.name ?? "",
            group_code: normalizedInitial.group_code ?? "",
            capacity: normalizedInitial.capacity ?? 0,
            semester_id: normalizedInitial.semester_id ?? "",
            subject_id: normalizedInitial.subject_id ?? "",
            teacher_id: normalizedInitial.teacher_id ?? "",
        });
    }, [normalizedInitial]);

    const [loading, setLoading] = useState(false);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const [semestersData, subjectsData, teachersData] =
                    await Promise.all([
                        semesterService.getAllWithAuth(),
                        subjectService.getAllWithAuth(),
                        teacherService.getAllWithAuth(),
                    ]);

                if (!mounted) return;

                setSemesters(semestersData ?? []);
                setSubjects(subjectsData ?? []);
                setTeachers(teachersData ?? []);
            } catch {
                toast.error("Error cargando catálogos.");
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const hasInitialTeacher = Boolean(values.teacher_id);

    const submit = async () => {
        const err = validate(values);
        if (err) {
            toast.error(err);
            return;
        }

        setLoading(true);
        try {
            await onSubmit(values);
            toast.success(
                mode === "create"
                    ? "Grupo creado correctamente."
                    : "Grupo actualizado correctamente."
            );
        } catch (e: any) {
            toast.error(e?.message ?? "Error al guardar el grupo.");
        } finally {
            setLoading(false);
        }
    };

    const title = mode === "create" ? "Crear grupo" : "Editar grupo";

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-2">{title}</h2>
                <p className="text-sm text-gray-500 mb-6">
                    {mode === "create"
                        ? "Completa los datos para crear un nuevo grupo."
                        : "Actualiza la información del grupo."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Nombre</label>
                        <input
                            value={values.name}
                            onChange={(e) =>
                                setValues((v) => ({ ...v, name: e.target.value }))
                            }
                            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="Grupo A"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Código</label>
                        <input
                            value={values.group_code}
                            onChange={(e) =>
                                setValues((v) => ({
                                    ...v,
                                    group_code: e.target.value,
                                }))
                            }
                            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                            placeholder="G-01"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Capacidad</label>
                        <input
                            type="number"
                            value={values.capacity}
                            onChange={(e) =>
                                setValues((v) => ({
                                    ...v,
                                    capacity: asNumber(e.target.value),
                                }))
                            }
                            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                            min={1}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Semestre</label>
                        <select
                            value={values.semester_id}
                            onChange={(e) =>
                                setValues((v) => ({
                                    ...v,
                                    semester_id: e.target.value,
                                }))
                            }
                            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                        >
                            <option value="">Selecciona un semestre</option>
                            {semesters.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Asignatura</label>
                        <select
                            value={values.subject_id}
                            onChange={(e) =>
                                setValues((v) => ({
                                    ...v,
                                    subject_id: e.target.value,
                                }))
                            }
                            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                        >
                            <option value="">Selecciona una asignatura</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.code ?? ""})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Docente</label>
                        <select
                            value={values.teacher_id}
                            onChange={(e) =>
                                setValues((v) => ({
                                    ...v,
                                    teacher_id: e.target.value,
                                }))
                            }
                            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700"
                        >
                            <option value="">Selecciona un docente</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.first_name} {t.last_name}
                                </option>
                            ))}
                        </select>

                        {!hasInitialTeacher && mode === "edit" ? (
                            <span className="text-xs text-gray-500">
                                Si el grupo no trae docente, selecciona uno.
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8">
                    <button
                        onClick={onCancel}
                        type="button"
                        className="border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-xl transition-all"
                        disabled={loading}
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={submit}
                        type="button"
                        className={`px-6 py-3 rounded-xl text-white transition-all inline-flex items-center gap-2 ${loading
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-green-700 hover:bg-green-800"
                            }`}
                        disabled={loading}
                    >
                        {loading ? (
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
};

export default GroupForm;

