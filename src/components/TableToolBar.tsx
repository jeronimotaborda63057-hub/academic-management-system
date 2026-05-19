import React from "react";
import type { FilterConfig } from "../models/interfaces/FilterConfig";

interface TableToolbarProps {
    searchPlaceholder?: string;
    filters?: FilterConfig[];
    filterValues?: Record<string, string>;
    onSearchChange?: (value: string) => void;
    onFilterChange?: (key: string, value: string) => void;
    onClear?: () => void;
    actionLabel?: string;
    onAction?: () => void;
}


const TableToolbar: React.FC<TableToolbarProps> = ({
    searchPlaceholder = "Buscar...",
    filters = [],
    filterValues = {},
    onSearchChange,
    onFilterChange,
    onClear,
    actionLabel,
    onAction,
}) => {
    return (
        <div className="w-full bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-2xl px-4 py-4 flex items-end gap-4">

            <div className="relative w-[330px]">
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </span>
            </div>

            {filters.map((filter) => (
                <div
                    key={filter.key}
                    className="flex flex-col gap-1 w-[210px]"
                >
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {filter.label}
                    </label>

                    <select
                        value={filterValues[filter.key] ?? ""}
                        onChange={(e) =>
                            onFilterChange?.(filter.key, e.target.value)
                        }
                        className="w-full h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors"
                    >
                        <option value="">Todos</option>

                        {filter.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            ))}

            <button
                onClick={onClear}
                className="h-11 px-4 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition flex items-center gap-2"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                </svg>

                Limpiar filtros
            </button>

            {actionLabel && (
                <button
                    onClick={onAction}
                    className="ml-auto h-11 px-5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                >
                    <span className="text-lg leading-none">+</span>

                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default TableToolbar;