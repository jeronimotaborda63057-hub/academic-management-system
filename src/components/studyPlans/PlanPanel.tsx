import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";
import type { Career } from "../../models/Career";

export interface PlanPanelItem {
    planId: string;       // id del StudyPlan (para vincular/desvincular)
    subjectId: string;    // id del Subject
    subjectCode: string;
    subjectName: string;
    credits: number;
    suggestedSemester: number;
}

interface PlanPanelProps {
    items: PlanPanelItem[];
    selectedCareer: Career | null;
    selectedPlanYear: number | null;
    onRemove: (planId: string, subjectId: string) => void;
    onSelect: (subjectId: string) => void;
    selectedSubjectId: string | null;
}

const PlanPanel: React.FC<PlanPanelProps> = ({
    items,
    selectedCareer,
    selectedPlanYear,
    onRemove,
    onSelect,
    selectedSubjectId,
}) => {
    const { setNodeRef, isOver } = useDroppable({ id: "plan-panel" });

    const bySemester: Record<number, PlanPanelItem[]> = {};
    items.forEach((item) => {
        if (!bySemester[item.suggestedSemester]) {
            bySemester[item.suggestedSemester] = [];
        }
        bySemester[item.suggestedSemester].push(item);
    });

    const semesters = Object.keys(bySemester).map(Number).sort((a, b) => a - b);
    const totalCredits = items.reduce((sum, i) => sum + i.credits, 0);

    return (
        <div
            ref={setNodeRef}
            className={`rounded-2xl border-2 transition-colors bg-white dark:bg-boxdark flex flex-col h-[600px]
                ${isOver
                    ? "border-primary border-dashed bg-primary bg-opacity-5"
                    : "border-stroke dark:border-strokedark"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                <div>
                    <h3 className="text-sm font-semibold text-black dark:text-white">
                        {selectedCareer && selectedPlanYear
                            ? `Plan ${selectedPlanYear} — ${selectedCareer.name}`
                            : "Plan de estudios"}
                    </h3>
                    {items.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                            {items.length} asignaturas · {totalCredits} créditos totales
                        </p>
                    )}
                </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-4">

                {!selectedCareer && (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                            <rect x="9" y="3" width="6" height="4" rx="1" />
                        </svg>
                        <p className="text-sm text-gray-400">
                            Selecciona una carrera para ver su plan
                        </p>
                    </div>
                )}

                {selectedCareer && !selectedPlanYear && (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                        <p className="text-sm text-gray-400">
                            Selecciona una versión del plan
                        </p>
                    </div>
                )}

                {selectedCareer && selectedPlanYear && items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-center border-2 border-dashed border-gray-200 dark:border-strokedark rounded-xl p-6">
                        <p className="text-sm text-gray-400">
                            Arrastra asignaturas aquí para agregarlas al plan
                        </p>
                    </div>
                )}

                {selectedCareer && selectedPlanYear && items.length > 0 && (
                    <div className="flex flex-col gap-5">
                        {semesters.map((sem) => (
                            <div key={sem}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Semestre {sem}
                                    </span>
                                    <span className="text-xs text-gray-300">
                                        ({bySemester[sem].length} asignatura{bySemester[sem].length !== 1 ? "s" : ""})
                                    </span>
                                </div>

                                <div className="grid grid-cols-[80px_1fr_70px_50px] gap-2 px-3 mb-1">
                                    <span className="text-xs text-gray-400">Código</span>
                                    <span className="text-xs text-gray-400">Asignatura</span>
                                    <span className="text-xs text-gray-400 text-center">Créditos</span>
                                    <span className="text-xs text-gray-400 text-center">Acción</span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    {bySemester[sem].map((item) => (
                                        <div
                                            key={item.subjectId}
                                            onClick={() => onSelect(item.subjectId)}
                                            className={`grid grid-cols-[80px_1fr_70px_50px] gap-2 items-center px-3 py-2 rounded-lg border cursor-pointer transition-colors
                                                ${selectedSubjectId === item.subjectId
                                                    ? "border-primary bg-primary bg-opacity-5"
                                                    : "border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4"
                                                }`}
                                        >
                                            <span className="text-xs font-semibold text-gray-500 truncate">
                                                {item.subjectCode}
                                            </span>
                                            <span className="text-sm text-black dark:text-white truncate">
                                                {item.subjectName}
                                            </span>
                                            <span className="text-sm text-gray-500 text-center">
                                                {item.credits}
                                            </span>
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onRemove(item.planId, item.subjectId); }}
                                                    className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                                                    type="button"
                                                    title="Remover del plan"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedCareer && selectedPlanYear && (
                <div className={`px-4 py-2 border-t border-stroke dark:border-strokedark transition-colors ${isOver ? "bg-primary bg-opacity-5" : ""}`}>
                    <p className="text-xs text-gray-300 text-center">
                        {isOver ? "Suelta para agregar al plan" : "Arrastra asignaturas aquí para agregarlas"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PlanPanel;