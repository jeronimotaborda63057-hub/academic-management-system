import React, { useEffect, useState } from "react";
import { X, Info } from "lucide-react";
import type { Semester } from "../../models/Semester";
import type { SemesterForm } from "../../models/SemesterForm";
import type { Career } from "../../models/Career";

type SemesterModalForm = SemesterForm & {
    career_id: string;
};

interface SemesterFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (form: SemesterForm) => Promise<void>;
    initialData?: Semester | null;
    careers: Career[];
    isLoading?: boolean;
}

const SemesterFormModal: React.FC<SemesterFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    careers,
    isLoading = false,
}) => {
    const isEdit = Boolean(initialData);

    const [values, setValues] = useState<SemesterModalForm>({
        career_id:  "",
        code:       "",
        name:       "",
        start_date: "",
        end_date:   "",
        is_active:  false,
    });

    useEffect(() => {
        if (initialData) {
            setValues({
                career_id:  initialData.career_id ?? "",
                code:       initialData.code,
                name:       initialData.name,
                start_date: initialData.start_date,
                end_date:   initialData.end_date,
                is_active:  initialData.is_active,
            });
        } else {
            setValues({ career_id: "", code: "", name: "", start_date: "", end_date: "", is_active: false });
        }
    }, [initialData, isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setValues((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
    };

    const baseInput = "h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors w-full";
    const label = "text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider";

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />

            <div className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
                    <h2 className="text-base font-semibold text-black dark:text-white">
                        {isEdit ? "Editar semestre" : "Nuevo semestre"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">

                    {/* Carrera */}
                    <div className="flex flex-col gap-1.5">
                        <label className={label}>
                            Carrera <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="career_id"
                            value={values.career_id}
                            onChange={handleChange}
                            disabled={isEdit}
                            required
                            className={`${baseInput} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <option value="">Selecciona una carrera</option>
                            {careers.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Código y Nombre */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className={label}>
                                Código <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={values.code}
                                onChange={handleChange}
                                placeholder="Ej. 2024-1"
                                required
                                className={baseInput}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={label}>
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                placeholder="Ej. 2024 - 1"
                                required
                                className={baseInput}
                            />
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className={label}>
                                Fecha inicio <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={values.start_date}
                                onChange={handleChange}
                                required
                                className={baseInput}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={label}>
                                Fecha fin <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="end_date"
                                value={values.end_date}
                                onChange={handleChange}
                                required
                                className={baseInput}
                            />
                        </div>
                    </div>

                    {/* Estado — solo en edición (HU-02 criterio 4) */}
                    {isEdit && (
                        <div className="flex flex-col gap-1.5">
                            <label className={label}>
                                Estado <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="is_active"
                                value={values.is_active ? "true" : "false"}
                                onChange={(e) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        is_active: e.target.value === "true",
                                    }))
                                }
                                className={baseInput}
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    )}

                    {/* Aviso HU-02 criterio 4 — solo en crear */}
                    {!isEdit && (
                        <div className="flex items-start gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 px-4 py-3">
                            <Info size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-green-700 dark:text-green-400">
                                Al activar este semestre, el sistema desactivará automáticamente el semestre activo actual de esta carrera.
                            </p>
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 px-5 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="h-11 px-5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                        >
                            {isLoading
                                ? "Guardando..."
                                : isEdit
                                    ? "Guardar cambios"
                                    : "Guardar semestre"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default SemesterFormModal;
