import { useState } from "react";

import { TABLE_PAGE_SIZE_OPTIONS } from "../../hooks/useTablePagination";

interface TablePaginationControlsProps {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    onItemsPerPageChange: (value: number) => void;
    onPageChange: (page: number) => void;
}

const TablePaginationControls = ({
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    onItemsPerPageChange,
    onPageChange,
}: TablePaginationControlsProps) => {
    const [pageDraft, setPageDraft] = useState<string | null>(null);
    const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const lastItem = Math.min(currentPage * itemsPerPage, totalItems);
    const pageInput = pageDraft ?? String(currentPage);

    const submitPage = () => {
        const nextPage = Number(pageInput);
        if (Number.isNaN(nextPage)) {
            setPageDraft(null);
            return;
        }

        onPageChange(nextPage);
        setPageDraft(null);
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-white px-4 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-500">
                Mostrando {firstItem}-{lastItem} de {totalItems}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    Filas
                    <select
                        value={itemsPerPage}
                        onChange={(event) => onItemsPerPageChange(Number(event.target.value))}
                        className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm outline-none focus:border-primary"
                    >
                        {TABLE_PAGE_SIZE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Anterior
                    </button>

                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        Pagina
                        <input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={pageInput}
                            onChange={(event) => setPageDraft(event.target.value)}
                            onBlur={submitPage}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") submitPage();
                            }}
                            className="h-9 w-16 rounded-lg border border-gray-200 px-2 text-center text-sm outline-none focus:border-primary"
                        />
                        de {totalPages}
                    </label>

                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TablePaginationControls;
