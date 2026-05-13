import { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface SemesterFormData {
    start_date: string;
    end_date: string;
    is_active: boolean;
}

interface Props {
    initialValues: SemesterFormData;
    onSubmit: (data: SemesterFormData) => Promise<void>;
    isEdit?: boolean;
}

export default function SemesterForm({
    initialValues,
    onSubmit,
    isEdit = false,
}: Props) {
    const [formData, setFormData] =
        useState<SemesterFormData>(initialValues);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (
        name: keyof SemesterFormData,
        value: string | boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación básica
        if (formData.start_date > formData.end_date) {
            alert("La fecha de inicio no puede ser mayor a la de fin");
            return;
        }

        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <div className="bg-white shadow-md rounded-2xl p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">
                {isEdit ? "Editar Semestre" : "Crear Semestre"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Fecha inicio */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Fecha de inicio
                    </label>
                    <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                            handleChange("start_date", e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2"
                        required
                    />
                </div>

                {/* Fecha fin */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Fecha de fin
                    </label>
                    <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) =>
                            handleChange("end_date", e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2"
                        required
                    />
                </div>

                {/* Estado */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                            handleChange("is_active", e.target.checked)
                        }
                    />
                    <label>Activo</label>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/semesters")}
                        className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading
                            ? "Guardando..."
                            : isEdit
                                ? "Actualizar"
                                : "Crear"}
                    </button>
                </div>
            </form>
        </div>
    );
}