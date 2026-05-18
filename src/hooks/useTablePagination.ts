import { useMemo, useState } from "react";

interface UseTablePaginationOptions<T> {
    data: T[];
    initialItemsPerPage: number;
}

export const TABLE_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const useTablePagination = <T,>({
    data,
    initialItemsPerPage,
}: UseTablePaginationOptions<T>) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

    const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
    const normalizedPage = Math.min(currentPage, totalPages);

    const paginatedData = useMemo(() => {
        const startIndex = (normalizedPage - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    }, [data, itemsPerPage, normalizedPage]);

    const changePage = (page: number) => {
        setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    };

    const changeItemsPerPage = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    return {
        currentPage: normalizedPage,
        itemsPerPage,
        paginatedData,
        totalItems: data.length,
        totalPages,
        changePage,
        changeItemsPerPage,
    };
};
