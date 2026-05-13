import React from "react";
import DraggableItem from "../DraggableItem";

export interface CatalogItem {
    id: string;
    code: string;
    name: string;
    credits: number;
    isInPlan: boolean;
}

interface SubjectCatalogProps {
    items: CatalogItem[];
    search: string;
    onSearchChange: (value: string) => void;
}

const SubjectCatalog: React.FC<SubjectCatalogProps> = ({
    items,
    search,
    onSearchChange,
}) => {
    return (
        <div className="rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-4 flex flex-col gap-3 h-[600px]">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-black dark:text-white">
                    Catálogo de asignaturas
                </h3>
                <span className="text-xs text-gray-400">
                    {items.length} asignaturas
                </span>
            </div>

            {/* Buscador */}
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar por nombre o código..."
                    className="w-full h-9 pl-3 pr-9 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm outline-none focus:border-primary transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                </span>
            </div>

            {/* Lista */}
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
                {items.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center mt-8">
                        No se encontraron asignaturas
                    </p>
                ) : (
                    items.map((item) => (
                        <DraggableItem
                            key={item.id}
                            id={item.id}
                            disabled={item.isInPlan}
                        >
                            <div className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors
                                ${item.isInPlan
                                    ? "border-gray-200 bg-gray-50 dark:bg-meta-4 opacity-50"
                                    : "border-stroke dark:border-strokedark bg-white dark:bg-boxdark hover:border-primary hover:shadow-sm"
                                }`}
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500">
                                        {item.code}
                                    </span>
                                    <span className="text-sm font-medium text-black dark:text-white">
                                        {item.name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                        {item.credits} créditos
                                    </span>
                                    {item.isInPlan && (
                                        <span className="text-xs text-primary font-medium">✓</span>
                                    )}
                                </div>
                            </div>
                        </DraggableItem>
                    ))
                )}
            </div>

            {/* Hint */}
            <p className="text-xs text-gray-400 text-center border-t border-stroke dark:border-strokedark pt-3">
                Arrastra una asignatura al plan para agregarla
            </p>
        </div>
    );
};

export default SubjectCatalog;