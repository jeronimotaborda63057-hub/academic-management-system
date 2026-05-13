import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { subjectService } from "../../services/subjectService";
import type { SubjectForm } from "../../models/Subject";
import FormLayout from "../../components/FormLayout";
import Swal from "sweetalert2";

const Create: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [values, setValues] = useState({
        code: "", name: "", description: "", credits: "1",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload: SubjectForm = {
                code: values.code, name: values.name,
                description: values.description,
                credits: Number(values.credits), is_active: true,
            };
            const result = await subjectService.create(payload);
            if (!result) throw new Error();
            Swal.fire("Éxito", "Asignatura creada correctamente.", "success");
            navigate("/subjects/list");
        } catch (error: any) {
            if (error.response?.status === 409) {
                Swal.fire("Error", "Ya existe una asignatura con ese código.", "error");
            } else {
                Swal.fire("Error", "Ocurrió un error al crear la asignatura.", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const baseInput = "h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors w-full";
    const labelClass = "text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider";

    return (
        <FormLayout
            title="Nueva asignatura"
            subtitle="Completa los datos para registrar una nueva asignatura."
            breadcrumb={["Inicio", "Asignaturas", "Crear"]}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/subjects/list")}
            submitLabel="Guardar asignatura"
            isLoading={isLoading}
        >
            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Código <span className="text-red-500">*</span></label>
                <input type="text" name="code" value={values.code} onChange={handleChange} placeholder="Ej. MAT-101" required className={baseInput} />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Nombre <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={values.name} onChange={handleChange} placeholder="Ej. Matemáticas I" required className={baseInput} />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Créditos <span className="text-red-500">*</span></label>
                <input type="number" name="credits" value={values.credits} onChange={handleChange} min="1" max="20" required className={baseInput} />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Descripción</label>
                <textarea name="description" value={values.description} onChange={handleChange} placeholder="Describe la asignatura..." rows={3} maxLength={200} className="px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors resize-none" />
                <p className="text-xs text-right text-gray-400">{values.description.length}/200</p>
            </div>
        </FormLayout>
    );
};

export default Create;