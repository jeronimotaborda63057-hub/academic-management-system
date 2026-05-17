import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import type { Group } from "../models/Group";
import type { RootState } from "../store/store";
import { groupService } from "../services/groupService";
import { getTeacherProfile } from "./useTeacherDetail";

const ITEMS_PER_PAGE = 10;

export const getGroupSchedule = (group: Group): string => {
    const withSchedule = group as Group & { schedule?: string; horario?: string };
    return withSchedule.schedule ?? withSchedule.horario ?? "Sin horario";
};

export const useTeacherGroups = () => {
    const currentUser = useSelector((state: RootState) => state.user.user);
    const currentTeacherId = getTeacherProfile(currentUser)?.id ?? "";

    const [groups, setGroups] = useState<Group[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadGroups = async () => {
            if (!currentTeacherId) {
                setGroups([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const teacherGroups = await groupService.getByTeacher(currentTeacherId);
                setGroups(teacherGroups);
            } catch {
                setError("No fue posible cargar tus grupos.");
            } finally {
                setLoading(false);
            }
        };

        loadGroups();
    }, [currentTeacherId]);

    const totalPages = Math.max(1, Math.ceil(groups.length / ITEMS_PER_PAGE));
    const normalizedCurrentPage = Math.min(currentPage, totalPages);

    const paginatedGroups = useMemo(() => {
        const start = (normalizedCurrentPage - 1) * ITEMS_PER_PAGE;
        return groups.slice(start, start + ITEMS_PER_PAGE);
    }, [normalizedCurrentPage, groups]);

    return {
        currentPage: normalizedCurrentPage,
        error,
        groups,
        itemsPerPage: ITEMS_PER_PAGE,
        loading,
        paginatedGroups,
        setCurrentPage,
    };
};
