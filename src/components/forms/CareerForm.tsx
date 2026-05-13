import { useState } from "react";
import type { CareerForm } from "../../models/CareerForm";
import { useNavigate } from "react-router-dom";
import PageHeader from "../PageHeader";

interface CareerFormProps {
    initialValues: CareerForm;
    onSubmit: (data: CareerForm) => Promise<void>;
    isEdit?: boolean;
}

export default function CareerForm({
    initialValues,
    onSubmit,
    isEdit = false,
}: CareerFormProps) {
    const [formData, setFormData] = useState<CareerForm>(initialValues);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (
        name: keyof CareerForm,
        value: string | boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <div>
            {/* HEADER */}
            <PageHeader
                title={isEdit ? "Editar carrera" : "Nueva carrera"}
                subtitle="Gestiona la información de la carrera académica."
                breadcrumb={["Inicio", "Carreras", isEdit ? "Editar" : "Crear"]}
            />

            {/* CARD */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 max-w-3xl mx-auto">

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Código */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Código
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) =>
                                    handleChange("code", e.target.value)
                                }
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Ej: ING-SIS"
                                required
                            />
                        </div>

                        {/* Estado */}
                        <div className="flex items-center gap-3 mt-6">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) =>
                                    handleChange("is_active", e.target.checked)
                                }
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-600">
                                Carrera activa
                            </span>

                            <span
                                className={`ml-auto text-xs px-3 py-1 rounded-full font-medium ${formData.is_active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {formData.is_active ? "Activa" : "Inactiva"}
                            </span>
                        </div>
                    </div>

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Ingeniería de Sistemas"
                            required
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description || ""}
                            onChange={(e) =>
                                handleChange("description", e.target.value)
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Describe la carrera..."
                        />
                    </div>

                    {/* BOTONES */}
                    <div className="flex justify-between items-center pt-4 border-t">

                        <button
                            type="button"
                            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 transition"
                            onClick={() => navigate("/careers/list")}
                            >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-5 py-2 text-sm rounded-lg text-white transition ${loading
                                ? "bg-gray-400"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                            onClick={() => navigate("/careers/list")}
                        >
                            {loading
                                ? "Guardando..."
                                : isEdit
                                    ? "Actualizar carrera"
                                    : "Crear carrera"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}