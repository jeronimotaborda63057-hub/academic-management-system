import { useCallback, useEffect, useMemo, useState } from "react";

import type { Career } from "../models/Career";
import type { Registration } from "../models/Registration";
import type { User } from "../models/User";
import type { UserFilters } from "../models/UserFilters";
import { careerService } from "../services/careerService";
import { registrationService } from "../services/registrationService";
import { userService } from "../services/userService";

export interface UserListRow extends User {
    careerLabel: string;
    careerNames: string[];
    estado: string;
    nombre: string;
}

const isVisibleUser = (user: User): boolean =>
    user.role === "TEACHER" || user.role === "STUDENT";

const isActiveRegistration = (registration: Registration): boolean =>
    registration.is_active === true || registration.academic_status === "ACTIVE";

const getUserProfileId = (user: User): string | undefined => user.profile?.id;

const getUserFullName = (user: User): string => {
    const profile = user.profile;
    const fullName = [profile?.first_name, profile?.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || "Sin información";
};

const uniqueValues = (values: string[]): string[] =>
    Array.from(new Set(values.filter(Boolean)));

const getRegistrationCareerName = (
    registration: Registration,
    careerById: Map<string, Career>
): string | undefined =>
    registration.career?.name ?? careerById.get(registration.career_id ?? "")?.name;

const resolveCareerNames = (
    user: User,
    registrationsByStudentId: Map<string, Registration[]>,
    careerById: Map<string, Career>
): string[] => {
    const profileId = getUserProfileId(user);
    if (!profileId) return [];

    const registrations = registrationsByStudentId.get(profileId) ?? [];
    const activeRegistrations = registrations.filter(isActiveRegistration);
    const sourceRegistrations = activeRegistrations.length > 0
        ? activeRegistrations
        : registrations;

    return uniqueValues(
        sourceRegistrations
            .map((registration) => getRegistrationCareerName(registration, careerById))
            .filter((name): name is string => Boolean(name))
    );
};

const buildUserRow = (
    user: User,
    registrationsByStudentId: Map<string, Registration[]>,
    careerById: Map<string, Career>
): UserListRow => {
    const careerNames = resolveCareerNames(user, registrationsByStudentId, careerById);

    return {
        ...user,
        careerLabel: careerNames.length > 0 ? careerNames.join(", ") : "-",
        careerNames,
        estado: user.is_active ? "Activo" : "Inactivo",
        nombre: getUserFullName(user),
    };
};

export const useUsersList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [search, setSearch] = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadReferences = async () => {
            const [careersData, registrationsData] = await Promise.all([
                careerService.getAll(),
                registrationService.getAll(),
            ]);

            setCareers(careersData);
            setRegistrations(registrationsData);
        };

        loadReferences();
    }, []);

    const fetchData = useCallback(async () => {
        const filters: UserFilters = {
            ...(filterValues.role ? { role: filterValues.role as UserFilters["role"] } : {}),
            ...(filterValues.is_active !== undefined && filterValues.is_active !== ""
                ? { is_active: filterValues.is_active === "true" }
                : {}),
            ...(filterValues.career_id ? { career_id: filterValues.career_id } : {}),
            ...(search ? { first_name: search } : {}),
        };

        const hasFilters = Object.keys(filters).length > 0;
        const userData = hasFilters
            ? await userService.search(filters)
            : await userService.getAll();

        setUsers(userData);
    }, [filterValues, search]);

    useEffect(() => {
        const timeout = setTimeout(() => fetchData(), 400);
        return () => clearTimeout(timeout);
    }, [fetchData]);

    const careerById = useMemo(
        () => new Map(careers.map((career) => [career.id, career])),
        [careers]
    );

    const registrationsByStudentId = useMemo(() => {
        const groupedRegistrations = new Map<string, Registration[]>();

        registrations.forEach((registration) => {
            if (!registration.student_id) return;

            const current = groupedRegistrations.get(registration.student_id) ?? [];
            groupedRegistrations.set(registration.student_id, [...current, registration]);
        });

        return groupedRegistrations;
    }, [registrations]);

    const tableData = useMemo(
        () =>
            users
                .filter(isVisibleUser)
                .map((user) => buildUserRow(user, registrationsByStudentId, careerById)),
        [careerById, registrationsByStudentId, users]
    );

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleClear = () => {
        setSearch("");
        setFilterValues({});
    };

    return {
        careers,
        fetchData,
        filterValues,
        handleClear,
        handleFilterChange,
        setSearch,
        tableData,
    };
};
