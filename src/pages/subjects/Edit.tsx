import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { subjectService } from "../../services/subjectService";
import PageHeader from "../../components/common/PageHeader";
import Swal from "sweetalert2";

const Edit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [values, setValues] = useState({
        code:        "",
        name:        "",
        description: "",
        credits:     "1",
    });

    useEffect(() => {
        if (!id) return;
        subjectService.getById(id).then((subject) => {
            if (!subject) return;
            setValues({
                code:        subject.code,
                name:        subject.name,
                description: subject.description ?? "",
                credits:     String(subject.credits),
            });
        });
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await subjectService.update(id, {
                name:        values.name,
                description: values.description,
                credits:     Number(values.credits),
            });
            if (!result) throw new Error();
            Swal.fire("Éxito", "Asignatura actualizada correctamente.", "success");
            navigate("/subjects/list");
        } catch {
            Swal.fire("Error", "Ocurrió un error al actualizar la asignatura.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const baseInput = "h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors w-full";
    const labelClass = "text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider";

    return (
        <div>
            <PageHeader
                title="Editar asignatura"
                subtitle="Modifica los datos de la asignatura."
                breadcrumb={["Inicio", "Asignaturas", "Editar"]}
            />

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-4"
            >
                {/* Código — solo lectura (HU-04 criterio 2) */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>
                        Código <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="code"
                        value={values.code}
                        disabled
                        className={`${baseInput} opacity-50 cursor-not-allowed`}
                    />
                    <p className="text-xs text-gray-400 dark:text-bodydark2">
                        El código no se puede modificar.
                    </p>
                </div>

                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        required
                        className={baseInput}
                    />
                </div>

                {/* Créditos */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>
                        Créditos <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="credits"
                        value={values.credits}
                        onChange={handleChange}
                        min="1"
                        max="20"
                        required
                        className={baseInput}
                    />
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Descripción</label>
                    <textarea
                        name="description"
                        value={values.description}
                        onChange={handleChange}
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
                        onClick={() => navigate("/subjects")}
                        className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                        {isLoading ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Edit;