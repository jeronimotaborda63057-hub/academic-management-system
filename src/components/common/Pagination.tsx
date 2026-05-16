import React from "react";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

const getPageNumbers = (currentPage: number, totalPages: number): number[] => {
    const visiblePages = 5;
    const halfWindow = Math.floor(visiblePages / 2);
    const start = Math.max(1, Math.min(currentPage - halfWindow, totalPages - visiblePages + 1));
    const end = Math.min(totalPages, start + visiblePages - 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const normalizedPage = Math.min(Math.max(currentPage, 1), totalPages);
    const pageNumbers = getPageNumbers(normalizedPage, totalPages);
    const firstItem = totalItems === 0 ? 0 : (normalizedPage - 1) * itemsPerPage + 1;
    const lastItem = Math.min(normalizedPage * itemsPerPage, totalItems);

    const goToPage = (page: number) => {
        const nextPage = Math.min(Math.max(page, 1), totalPages);
        if (nextPage !== normalizedPage) onPageChange(nextPage);
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
                Mostrando {firstItem}-{lastItem} de {totalItems}
            </p>

            <nav className="flex items-center gap-1" aria-label="Paginacion">
                <button
                    type="button"
                    onClick={() => goToPage(normalizedPage - 1)}
                    disabled={normalizedPage === 1}
                    className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Anterior
                </button>

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        aria-current={page === normalizedPage ? "page" : undefined}
                        className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition ${
                            page === normalizedPage
                                ? "border-primary bg-primary text-white"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => goToPage(normalizedPage + 1)}
                    disabled={normalizedPage === totalPages}
                    className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Siguiente
                </button>
            </nav>
        </div>
    );
};

export default Pagination;
