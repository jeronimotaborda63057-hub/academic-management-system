import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Career } from "../../models/uml/Career";
import type { CareerForm } from "../../models/interfaces/CareerForm";
interface CareerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (form: CareerForm) => Promise<void>;
    initialData?: Career | null;
    isLoading?: boolean;
}

const CareerFormModal: React.FC<CareerFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading = false,
}) => {
    const isEdit = Boolean(initialData);

    const [values, setValues] = useState<Record<string, string>>({
        code: "",
        name: "",
        description: "",
    });

    // ✅ Carga los datos al abrir en modo edición
    useEffect(() => {
        if (initialData) {
            setValues({
                code: initialData.code,
                name: initialData.name,
                description: initialData.description ?? "",
            });
        } else {
            setValues({ code: "", name: "", description: "" });
        }
    }, [initialData, isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            code: values.code,
            name: values.name,
            description: values.description,
            is_active: initialData?.is_active ?? true,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
                    <h2 className="text-base font-semibold text-black dark:text-white">
                        {isEdit ? "Editar carrera" : "Nueva carrera"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black dark:hover:text-white transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">

                    {/* Código — solo lectura en edición */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                            Código <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={values.code}
                            onChange={handleChange}
                            disabled={isEdit}
                            placeholder="Ej. ING-SIS"
                            required
                            className="h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {isEdit && (
                            <p className="text-xs text-gray-400 dark:text-bodydark2">
                                El código no se puede modificar.
                            </p>
                        )}
                    </div>

                    {/* Nombre */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            placeholder="Ej. Ingeniería de Sistemas"
                            required
                            className="h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={values.description}
                            onChange={handleChange}
                            placeholder="Describe la carrera..."
                            rows={3}
                            maxLength={200}
                            className="px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors resize-none"
                        />
                        <p className="text-xs text-right text-gray-400">
                            {values.description.length}/200
                        </p>
                    </div>

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
                                    : "Guardar carrera"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CareerFormModal;
