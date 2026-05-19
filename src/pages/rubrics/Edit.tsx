import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../components/ui/PageHeader";
import FormField from "../../components/multi-step-form/FormField";
import CriteriaEditor from "../../components/rubrics/CriteriaEditor";
import RubricStatusBadge from "../../components/rubrics/RubricStatusBadge";
import { useRubricForm } from "../../hooks/useRubricForm";
import { rubricService } from "../../services/rubricService";
import { criteriaService } from "../../services/criteriaService";
import { scaleService } from "../../services/scaleService";
import { useState } from "react";
import type { Rubric } from "../../models/uml/Rubric";

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "No se pudo actualizar la rúbrica.";
}

const Edit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [rubric, setRubric] = useState<Rubric | null>(null);

    const {
        form,
        setForm,
        criteriaRows,
        totalWeight,
        weightsValid,
        formValid,
        draftValid,
        addCriteria,
        updateCriteria,
        removeCriteria,
        resetCriteria,
    } = useRubricForm();

    useEffect(() => {
        if (!id) return;

        Promise.all([
            rubricService.getById(id),
            criteriaService.getByRubric(id),
        ])
            .then(([r, fetchedCriteria]) => {
                if (!r) return;

                setRubric(r);

                setForm({
                    title: r.title ?? "",
                    description: r.description ?? "",
                });

                resetCriteria(
                    fetchedCriteria.map((c) => ({
                        id: c.id ?? crypto.randomUUID(),
                        name: c.name ?? "",
                        description: c.description ?? "",
                        weight: c.weight ?? 0,
                    }))
                );
            })
            .catch(() => {
                Swal.fire("Error", "No se pudo cargar la rúbrica.", "error");
            })
            .finally(() => {
                setIsFetching(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const isArchived = rubric?.is_archived === true;
    const isPublished = rubric?.is_public === true;

    const validateScalesBeforePublish = async (): Promise<boolean> => {
        const criteriaIds = criteriaRows
            .map((c) => c.id)
            .filter(Boolean) as string[];

        if (criteriaIds.length === 0) return true;

        const scales = await scaleService.getByCriteria(criteriaIds);

        const scalesPerCriterion = criteriaIds.map((criterionId) => ({
            criterionId,
            name: criteriaRows.find((c) => c.id === criterionId)?.name ?? criterionId,
            count: scales.filter((s) => s.criterion_id === criterionId).length,
        }));

        const invalid = scalesPerCriterion.filter((c) => c.count < 2);

        if (invalid.length > 0) {
            const list = invalid
                .map((c) => `• ${c.name} (${c.count} nivel${c.count === 1 ? "" : "es"})`)
                .join("<br/>");

            await Swal.fire({
                icon: "error",
                title: "No se puede publicar",
                html: `Los siguientes criterios tienen menos de 2 niveles de escala:<br/><br/>${list}<br/><br/>Define al menos 2 niveles por criterio antes de publicar.`,
                confirmButtonText: "Entendido",
            });

            return false;
        }

        return true;
    };

    const handleSubmit = async (isPublic: boolean) => {
        if (isArchived)              return;
        if (isPublic && !formValid)  return;
        if (!isPublic && !draftValid) return;

        // ── E2: validación de escalas solo al publicar ──
        if (isPublic) {
            setIsLoading(true);
            const scalesValid = await validateScalesBeforePublish();
            if (!scalesValid) {
                setIsLoading(false);
                return;
            }
        } else {
            setIsLoading(true);
        }

        try {
            await rubricService.update(id!, {
                title: form.title,
                description: form.description,
                is_public: isPublic,
            });

            await criteriaService.deleteByRubric(id!);

            if (criteriaRows.length > 0) {
                await Promise.all(
                    criteriaRows.map((row) =>
                        criteriaService.create({
                            rubric_id: id,
                            name: row.name,
                            description: row.description,
                            weight: row.weight,
                        })
                    )
                );
            }

            await Swal.fire("¡Guardado!", "Rúbrica actualizada correctamente.", "success");
            navigate("/rubrics/list");
        } catch (error: unknown) {
            Swal.fire("Error", getErrorMessage(error), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnarchive = async () => {
        const { isConfirmed } = await Swal.fire({
            title: "¿Desarchivar rúbrica?",
            text: "Volverá a estar disponible como borrador.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Desarchivar",
            cancelButtonText: "Cancelar",
        });
        if (!isConfirmed) return;

        try {
            await rubricService.unarchive(id!);
            await Swal.fire("Desarchivada", "La rúbrica está disponible nuevamente.", "success");
            navigate("/rubrics/list");
        } catch {
            Swal.fire("Error", "No se pudo desarchivar la rúbrica.", "error");
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center p-10">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!rubric) {
        return (
            <p className="text-sm text-red-500 p-6">Rúbrica no encontrada.</p>
        );
    }

    return (
        <div>
            <PageHeader
                title="Editar rúbrica"
                subtitle="Modifica los datos de la rúbrica."
                breadcrumb={["Inicio", "Rúbricas", "Editar"]}
            />

            {isArchived && (
                <div className="mb-4 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                    <span className="font-semibold">Archivada:</span>
                    Esta rúbrica no puede modificarse. Desarchívala para editar.
                </div>
            )}

            <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-6">

                <div className="flex items-center gap-3 flex-wrap">
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
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, description: e.target.value }))
                            }
                            rows={3}
                            maxLength={300}
                            disabled={isArchived}
                            className="px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors resize-none disabled:opacity-60"
                        />
                        <p className="text-xs text-right text-gray-400">
                            {form.description.length}/300
                        </p>
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
                    <div className="flex justify-end gap-3 pt-2 border-t border-stroke dark:border-strokedark flex-wrap">
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
                                disabled={isLoading || !draftValid}
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
                            {isLoading
                                ? "Guardando..."
                                : isPublished
                                    ? "Guardar cambios"
                                    : "Publicar rúbrica"}
                        </button>
                    </div>
                )}

                {isArchived && (
                    <div className="flex justify-end gap-3 pt-2 border-t border-stroke dark:border-strokedark">
                        <button
                            type="button"
                            onClick={() => navigate("/rubrics/list")}
                            className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                        >
                            Volver
                        </button>
                        <button
                            type="button"
                            onClick={handleUnarchive}
                            className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-medium hover:bg-opacity-90 transition"
                        >
                            Desarchivar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Edit;