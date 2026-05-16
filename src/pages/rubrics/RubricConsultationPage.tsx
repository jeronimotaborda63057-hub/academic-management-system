import { ArrowLeft, Download, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { RubricEvaluationCard } from "../../components/rubrics/RubricEvaluationCard";
import { RubricHelpCards } from "../../components/rubrics/RubricHelpCards";
import { RubricInfoPanel } from "../../components/rubrics/RubricInfoPanel";
import { RubricReadOnlyTable } from "../../components/rubrics/RubricReadOnlyTable";
import PageHeader from "../../components/ui/PageHeader";
import type { RubricConsultationRecord } from "../../hooks/useRubricConsultation";
import { useRubricConsultation } from "../../hooks/useRubricConsultation";

const buildRubricText = (record: RubricConsultationRecord) => {
    const lines = [
        record.rubric.title ?? "Rubrica",
        "",
        record.rubric.description ?? "Sin descripcion.",
        "",
        "Criterios:",
    ];

    record.criteria.forEach((criterion) => {
        lines.push(`- ${criterion.name} (${criterion.weight ?? 0}%)`);
        if (criterion.description) lines.push(`  ${criterion.description}`);

        record.scales
            .filter((scale) => scale.criterion_id === criterion.id)
            .forEach((scale) => {
                lines.push(`  * ${scale.name} (${scale.value ?? 0}): ${scale.description ?? ""}`);
            });
    });

    return lines.join("\n");
};

const downloadRubric = (record: RubricConsultationRecord) => {
    const blob = new Blob([buildRubricText(record)], {
        type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = (record.rubric.title ?? "rubrica")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    link.href = url;
    link.download = `${fileName || "rubrica"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
};

const RubricConsultationPage = () => {
    const navigate = useNavigate();
    const { evaluationId } = useParams();
    const { error, loading, selectedRecord } = useRubricConsultation(evaluationId);

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
                Cargando rubrica...
            </div>
        );
    }

    if (error || !selectedRecord) {
        return (
            <div className="space-y-5">
                <PageHeader
                    title="Consultar rubrica de evaluacion"
                    subtitle="Visualiza la rubrica asociada a la evaluacion en modo lectura."
                    breadcrumb={["Inicio", "Mis evaluaciones", "Rubrica"]}
                />

                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
                    {error ?? "No se encontro una rubrica publicada para esta evaluacion."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <PageHeader
                title="Consultar rubrica de evaluacion"
                subtitle="Visualiza la rubrica asociada a la evaluacion en modo lectura."
                breadcrumb={[
                    "Inicio",
                    "Mis evaluaciones",
                    selectedRecord.evaluation.name ?? "Evaluacion",
                    "Rubrica",
                ]}
            />

            <button
                type="button"
                onClick={() => navigate("/rubrics/list")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
                <ArrowLeft size={16} />
                Volver a mis evaluaciones
            </button>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0 space-y-5">
                    <RubricEvaluationCard record={selectedRecord} />

                    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                                    <FileText size={22} />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Rúbrica</p>
                                    <h2 className="mt-1 text-lg font-semibold text-gray-900">
                                        {selectedRecord.rubric.title ?? "Rubrica sin titulo"}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <span>Estado:</span>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${selectedRecord.rubric.is_public
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {selectedRecord.rubric.is_public ? "Pública" : "Privada"}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => downloadRubric(selectedRecord)}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary px-4 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                                >
                                    <Download size={16} />
                                    Descargar rubrica
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Descripción
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                {selectedRecord.rubric.description ?? "Sin descripcion."}
                            </p>
                        </div>

                        <RubricReadOnlyTable
                            criteria={selectedRecord.criteria}
                            scales={selectedRecord.scales}
                        />
                    </section>
                </div>

                <div className="space-y-5">
                    <RubricInfoPanel record={selectedRecord} />
                    <RubricHelpCards />
                </div>
            </div>
        </div>
    );
};

export default RubricConsultationPage;
