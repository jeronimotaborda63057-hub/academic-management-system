import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { careerService } from "../../services/careerService";
import type { CareerForm } from "../../models/Career";
import PageHeader from "../../components/PageHeader";
import FormField from "../../components/multiStepForm/FormField";
import type { StepField } from "../../models/StepField";
import Swal from "sweetalert2";

const FIELDS: StepField[] = [
    { label: "Código",      name: "code",        type: "text",     required: true  },
    { label: "Nombre",      name: "name",        type: "text",     required: true  },
    { label: "Descripción", name: "description", type: "textarea", required: false },
];

const Create: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [values, setValues] = useState<Record<string, string>>({
        code: "", name: "", description: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload: CareerForm = {
                code:        values.code,
                name:        values.name,
                description: values.description,
                is_active:   true,
            };
            const result = await careerService.create(payload);
            if (!result) throw new Error();
            Swal.fire("Éxito", "Carrera creada correctamente.", "success");
            navigate("/careers/list");
        } catch {
            Swal.fire("Error", "Ocurrió un error al crear la carrera.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Nueva carrera"
                subtitle="Completa los datos para registrar una nueva carrera."
                breadcrumb={["Inicio", "Carreras", "Crear"]}
            />

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-4"
            >
                {FIELDS.map((field) =>
                    field.type === "textarea" ? (
                        <div key={field.name} className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                                {field.label}
                            </label>
                            <textarea
                                name={field.name}
                                value={values[field.name] ?? ""}
                                onChange={handleChange}
                                placeholder="Describe la carrera..."
                                rows={3}
                                maxLength={200}
                                className="px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors resize-none"
                            />
                            <p className="text-xs text-right text-gray-400">
                                {(values[field.name] ?? "").length}/200
                            </p>
                        </div>
                    ) : (
                        <FormField
                            key={field.name}
                            field={field}
                            value={values[field.name] ?? ""}
                            onChange={handleChange}
                        />
                    )
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/careers/list")}
                        className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                        {isLoading ? "Guardando..." : "Guardar carrera"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Create;