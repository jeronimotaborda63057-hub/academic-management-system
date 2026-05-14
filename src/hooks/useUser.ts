import { useState, useEffect, useCallback } from "react";
import { userService } from "../services/userService";
import type { User, CreateUserPayload } from "../models/User";
import type { UserFilters } from "../models/UserFilters";

export const useUser = (autoLoad = true) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (filters?: UserFilters) => {
        setLoading(true);
        setError(null);
        const data = filters && Object.keys(filters).length > 0
            ? await userService.search(filters)
            : await userService.getAll();
        setUsers(data);
        setLoading(false);
    }, []);

    const createUser = async (payload: CreateUserPayload): Promise<User | null> => {
        setError(null);
        const result = await userService.createUser(payload);
        if (!result) { setError("Error al crear el usuario"); return null; }
        await fetchUsers();
        return result;
    };

    const updateUser = async (id: string, data: Partial<User>): Promise<User | null> => {
        setError(null);
        const result = await userService.update(id, data);
        if (!result) { setError("Error al actualizar el usuario"); return null; }
        await fetchUsers();
        return result;
    };

    const deactivateUser = async (id: string): Promise<boolean> => {
        setError(null);
        const result = await userService.deactivate(id);
        if (!result) { setError("Error al desactivar el usuario"); return false; }
        await fetchUsers();
        return true;
    };

    useEffect(() => {
        if (autoLoad) fetchUsers();
    }, [autoLoad, fetchUsers]);

    return { users, loading, error, fetchUsers, createUser, updateUser, deactivateUser };
};