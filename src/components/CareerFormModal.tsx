import React, { useEffect, useState } from "react";
import type { Career, CareerForm } from "../models/Career";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CareerForm) => void;
    initialData?: Career | null;
}

const CareerFormModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}) => {

    const [form, setForm] = useState<CareerForm>({
        name: "",
        code: "",
        description: "",
        is_active: true,
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name,
                code: initialData.code,
                description: initialData.description || "",
                is_active: initialData.is_active,
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white rounded-xl p-6 w-[400px]">

                <h2 className="text-lg font-semibold mb-4">
                    {initialData ? "Editar carrera" : "Nueva carrera"}
                </h2>

                <input
                    placeholder="Código"
                    value={form.code}
                    disabled={!!initialData} // 👈 como en mockup
                    onChange={(e) =>
                        setForm({ ...form, code: e.target.value })
                    }
                    className="w-full border p-2 mb-3"
                />

                <input
                    placeholder="Nombre"
                    value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                    className="w-full border p-2 mb-3"
                />

                <textarea
                    placeholder="Descripción"
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                    className="w-full border p-2 mb-3"
                />

                <div className="flex justify-end gap-2">
                    <button onClick={onClose}>
                        Cancelar
                    </button>

                    <button
                        onClick={() => onSubmit(form)}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Guardar
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CareerFormModal;