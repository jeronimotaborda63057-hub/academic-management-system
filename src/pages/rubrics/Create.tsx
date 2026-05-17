import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../components/ui/PageHeader"; // ✅ FIX: ruta corregida
import FormField from "../../components/multi-step-form/FormField";
import CriteriaEditor from "../../components/rubrics/CriteriaEditor";
import { useRubricForm } from "../../hooks/useRubricForm";
import { rubricService } from "../../services/rubricService";
import { criteriaService } from "../../services/criteriaService";

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Error desconocido";
}

const Create: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        form,
        criteriaRows,
        totalWeight,
        weightsValid,
        formValid,
        draftValid,
        handleFormChange,
        addCriteria,
        updateCriteria,
        removeCriteria,
    } = useRubricForm();

    const handleSubmit = async (isPublic: boolean) => {
        if (isPublic && !formValid) return;
        if (!isPublic && !draftValid) return;

        setIsLoading(true);
        try {
            const rubric = await rubricService.create({
                title: form.title,
                description: form.description,
                is_public: isPublic,
            });

            if (!rubric?.id) {
                throw new Error("El servidor no devolvió una rúbrica válida.");
            }

            if (criteriaRows.length > 0) {
                await Promise.all(
                    criteriaRows.map((row) =>
                        criteriaService.create({
                            rubric_id: rubric.id,
                            name: row.name,
                            description: row.description,
                            weight: row.weight,
                        })
                    )
                );
            }

            Swal.fire(
                "¡Listo!",
                isPublic ? "Rúbrica publicada correctamente." : "Rúbrica guardada como borrador.",
                "success"
            );
            navigate("/rubrics/list");
        } catch (error: unknown) {
            Swal.fire("Error", getErrorMessage(error), "error");
            console.error("Error al guardar rúbrica:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Nueva rúbrica"
                subtitle="Crea un instrumento de evaluación con criterios y pesos."
                breadcrumb={["Inicio", "Rúbricas", "Crear"]}
            />

            <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-6">

                <section className="flex flex-col gap-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Datos de la rúbrica
                    </h2>

                    <FormField
                        field={{ name: "title", label: "Título", type: "text", required: true }}
                        value={form.title}
                        onChange={handleFormChange}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleFormChange}
                            placeholder="Describe el objetivo de esta rúbrica..."
                            rows={3}
                            maxLength={300}
                            className="px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors resize-none"
                        />
                        <p className="text-xs text-right text-gray-400">{form.description.length}/300</p>
                    </div>
                </section>

                <section>
                    <CriteriaEditor
                        rows={criteriaRows}
                        totalWeight={totalWeight}
                        weightsValid={weightsValid}
                        onAdd={addCriteria}
                        onUpdate={updateCriteria}
                        onRemove={removeCriteria}
                    />
                </section>

                <div className="flex justify-end gap-3 pt-2 border-t border-stroke dark:border-strokedark">
                    <button
                        type="button"
                        onClick={() => navigate("/rubrics/list")}
                        className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        disabled={isLoading || !draftValid}
                        onClick={() => handleSubmit(false)}
                        className="h-11 px-6 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition disabled:opacity-50"
                    >
                        {isLoading ? "Guardando..." : "Guardar borrador"}
                    </button>

                    <button
                        type="button"
                        disabled={isLoading || !formValid}
                        onClick={() => handleSubmit(true)}
                        className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {isLoading ? "Publicando..." : "Publicar rúbrica"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Create;
