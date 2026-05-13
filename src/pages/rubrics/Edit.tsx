import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import FormField from "../../components/multiStepForm/FormField";
import CriteriaEditor from "../../components/rubrics/CriteriaEditor";
import RubricStatusBadge from "../../components/rubrics/RubricStatusBadge";
import { useRubricForm } from "../../hooks/useRubricForm";
import { rubricService } from "../../services/rubricService";
import { criteriaService } from "../../services/criteriaService";
import { subjectService } from "../../services/subjectService";
import type { Subject } from "../../models/Subject";
import type { Rubric } from "../../models/Rubric";

const Edit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [rubric, setRubric] = useState<Rubric | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const {
        form,
        criteriaRows,
        totalWeight,
        weightsValid,
        formValid,
        handleFormChange,
        addCriteria,
        updateCriteria,
        removeCriteria,
    } = useRubricForm(
        rubric
            ? {
                title: rubric.title,
                description: rubric.description,
                subject_id: rubric.subject_id,
                criteria: rubric.criteria?.map((c) => ({
                    id: c.id ?? crypto.randomUUID(),
                    name: c.name ?? "",
                    description: c.description ?? "",
                    weight: c.weight ?? 0,
                })),
            }
            : undefined
    );

    useEffect(() => {
        Promise.all([
            rubricService.getById(id!),
            subjectService.getAll(),
        ]).then(([r, s]) => {
            setRubric(r);
            setSubjects(s ?? []);
            setIsFetching(false);
        });
    }, [id]);

    const isArchived  = rubric?.is_archived === true;
    const isPublished = rubric?.is_public   === true;

    const handleSubmit = async (isPublic: boolean) => {
        if (!formValid || isArchived) return;

        setIsLoading(true);
        try {
            await rubricService.update(id!, {
                title:       form.title,
                description: form.description,
                subject_id:  form.subject_id,
                is_public:   isPublic,
            });

            await Promise.all(
                criteriaRows.map((row) =>
                    criteriaService.create({
                        rubric_id:   id,
                        name:        row.name,
                        description: row.description,
                        weight:      row.weight,
                    })
                )
            );

            Swal.fire("¡Guardado!", "Rúbrica actualizada correctamente.", "success");
            navigate("/rubrics/list");
        } catch {
            Swal.fire("Error", "No se pudo actualizar la rúbrica.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <p className="text-sm text-gray-400 p-6">Cargando rúbrica...</p>;
    }

    if (!rubric) {
        return <p className="text-sm text-red-500 p-6">Rúbrica no encontrada.</p>;
    }

    return (
        <div>
            <PageHeader
                title="Editar rúbrica"
                subtitle="Modifica los datos de la rúbrica."
                breadcrumb={["Inicio", "Rúbricas", "Editar"]}
            />

            {isArchived && (
                <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                    Esta rúbrica está archivada y no puede modificarse.
                </div>
            )}

            <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-6">

                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Estado:</span>
                    <RubricStatusBadge isPublic={rubric.is_public} isArchived={rubric.is_archived} />
                    {isPublished && !isArchived && (
                        <span className="text-xs text-gray-400 italic">
                            — Una rúbrica publicada no puede eliminarse, solo archivarse.
                        </span>
                    )}
                </div>

                <section className="flex flex-col gap-4">
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
                            rows={3}
                            maxLength={300}
                            disabled={isArchived}
                            className="px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors resize-none disabled:opacity-60"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                            Asignatura <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="subject_id"
                            value={form.subject_id}
                            onChange={handleFormChange}
                            disabled={isArchived}
                            className="h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors disabled:opacity-60"
                        >
                            <option value="">Selecciona una asignatura</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </section>

                {!isArchived && (
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
                )}

                {!isArchived && (
                    <div className="flex justify-end gap-3 pt-2 border-t border-stroke dark:border-strokedark">
                        <button
                            type="button"
                            onClick={() => navigate("/rubrics/list")}
                            className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                        >
                            Cancelar
                        </button>

                        {!isPublished && (
                            <button
                                type="button"
                                disabled={isLoading || form.title.trim() === ""}
                                onClick={() => handleSubmit(false)}
                                className="h-11 px-6 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition disabled:opacity-50"
                            >
                                {isLoading ? "Guardando..." : "Guardar borrador"}
                            </button>
                        )}

                        <button
                            type="button"
                            disabled={isLoading || !formValid}
                            onClick={() => handleSubmit(true)}
                            className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {isLoading ? "Guardando..." : isPublished ? "Guardar cambios" : "Publicar rúbrica"}
                        </button>
                    </div>
                )}

                {isArchived && (
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/rubrics/list")}
                            className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 transition"
                        >
                            Volver
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Edit;