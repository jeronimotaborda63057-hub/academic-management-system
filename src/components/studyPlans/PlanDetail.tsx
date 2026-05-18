import React from "react";
import type { Career } from "../../models/uml/Career";

export interface PlanVersion {
    year: number;
    isPublished: boolean;
    totalSubjects: number;
    updatedAt?: string;
}

export interface PlanDetailData {
    careerName: string;
    careerCode: string;
    totalSubjects: number;
    totalCredits: number;
    lastUpdated?: string;
    semesterCount: number;
    versions: PlanVersion[];
}

interface PlanDetailProps {
    data: PlanDetailData | null;
    selectedCareer: Career | null;
}

const PlanDetail: React.FC<PlanDetailProps> = ({ data, selectedCareer }) => {
    if (!selectedCareer || !data) {
        return (
            <div className="rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-4 h-[600px] flex flex-col items-center justify-center gap-2 text-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <p className="text-sm text-gray-400">
                    Selecciona una carrera para ver el detalle del plan
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-4 h-[600px] flex flex-col gap-4 overflow-y-auto">

            {/* Header */}
            <h3 className="text-sm font-semibold text-black dark:text-white">
                Detalles del plan
            </h3>

            {/* Info general */}
            <div className="flex flex-col gap-0">
                {[
                    { label: "Carrera", value: `${data.careerName} (${data.careerCode})` },
                    { label: "Total asignaturas", value: data.totalSubjects },
                    { label: "Total créditos", value: data.totalCredits },
                    { label: "Semestres", value: data.semesterCount },
                    {
                        label: "Última actualización",
                        value: data.lastUpdated
                            ? new Date(data.lastUpdated).toLocaleDateString("es-CO")
                            : "—"
                    },
                ].map(({ label, value }) => (
                    <div
                        key={label}
                        className="flex items-center justify-between py-2 border-b border-stroke dark:border-strokedark last:border-0"
                    >
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-sm font-medium text-black dark:text-white text-right">
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Historial de versiones */}
            <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Historial de versiones
                </h4>

                {data.versions.length === 0 ? (
                    <p className="text-xs text-gray-400">Sin versiones registradas</p>
                ) : (
                    data.versions.map((version) => (
                        <div
                            key={version.year}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
                                version.isPublished
                                    ? "border-green-200 bg-green-50 dark:bg-meta-4"
                                    : "border-stroke dark:border-strokedark"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-black dark:text-white">
                                    {version.year}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    version.isPublished
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                }`}>
                                    {version.isPublished ? "Publicado" : "Borrador"}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-400">
                                    {version.totalSubjects} asignaturas
                                </span>
                                {version.updatedAt && (
                                    <span className="text-xs text-gray-300">
                                        {new Date(version.updatedAt).toLocaleDateString("es-CO")}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Nota informativa */}
            <div className="mt-auto rounded-lg bg-blue-50 dark:bg-meta-4 border border-blue-100 dark:border-strokedark p-3">
                <p className="text-xs text-blue-600 dark:text-bodydark2">
                    Los cambios al plan solo aplican a nuevas cohortes, no a estudiantes ya matriculados.
                </p>
            </div>
        </div>
    );
};

export default PlanDetail;