import { useEffect, useMemo, useState } from "react";

import type { Career } from "../models/uml/Career";
import type { Registration } from "../models/uml/Registration";
import type { User } from "../models/uml/User";
import { careerService } from "../services/careerService";
import { registrationService } from "../services/registrationService";
import { userService } from "../services/userService";

export interface UserListRow extends User {
    careerLabel: string;
    careerNames: string[];
    estado: string;
    nombre: string;
}

/* ---------------- NORMALIZADORES ---------------- */

const normalizeRole = (role: any) => {
    const r = String(role ?? "").toUpperCase();

    if (r === "TEACHER" || r === "DOCENTE") return "TEACHER";
    if (r === "STUDENT" || r === "ESTUDIANTE") return "STUDENT";

    return "STUDENT";
};

const normalizeBool = (value: any) =>
    value === true || value === "true" || value === 1 || value === "1";

/* ---------------- HELPERS ---------------- */

const isVisibleUser = (user: User) =>
    normalizeRole(user.role) === "TEACHER" ||
    normalizeRole(user.role) === "STUDENT";

const getFullName = (user: User) =>
    [user.profile?.first_name, user.profile?.last_name]
        .filter(Boolean)
        .join(" ") || "Sin información";

const unique = (arr: string[]) =>
    Array.from(new Set(arr.filter(Boolean)));

const isActiveReg = (r: Registration) =>
    r.is_active === true || r.academic_status === "ACTIVE";

const getCareerName = (
    reg: Registration,
    careerMap: Map<string, Career>
) =>
    reg.career?.name ??
    careerMap.get(reg.career_id ?? "")?.name;

const resolveCareers = (
    user: User,
    regMap: Map<string, Registration[]>,
    careerMap: Map<string, Career>
) => {
    const id = user.profile?.id;
    if (!id) return [];

    const regs = regMap.get(id) ?? [];
    const active = regs.filter(isActiveReg);

    const source = active.length ? active : regs;

    return unique(
        source
            .map((r) => getCareerName(r, careerMap))
            .filter((x): x is string => Boolean(x))
    );
};

/* ---------------- ROW BUILDER ---------------- */

const buildRow = (
    user: User,
    regMap: Map<string, Registration[]>,
    careerMap: Map<string, Career>
): UserListRow => {
    const careers = resolveCareers(user, regMap, careerMap);

    return {
        ...user,
        role: normalizeRole(user.role),
        careerLabel: careers.length ? careers.join(", ") : "-",
        careerNames: careers,
        estado: normalizeBool(user.is_active)
            ? "Activo"
            : "Inactivo",
        nombre: getFullName(user),
    };
};

/* ---------------- HOOK ---------------- */

export const useUsersList = () => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [registrations, setRegistrations] =
        useState<Registration[]>([]);

    const [search, setSearch] = useState("");
    const [filterValues, setFilterValues] = useState<
        Record<string, string>
    >({});

    /* ---------------- LOAD REFERENCES ---------------- */

    useEffect(() => {
        const load = async () => {
            const [c, r] = await Promise.all([
                careerService.getAll(),
                registrationService.getAll(),
            ]);

            setCareers(c);
            setRegistrations(r);
        };

        load();
    }, []);

    /* ---------------- LOAD USERS (UNA VEZ) ---------------- */

    useEffect(() => {
        const loadUsers = async () => {
            const data = await userService.getAll();
            setAllUsers(data);
        };

        loadUsers();
    }, []);

    /* ---------------- MAPS ---------------- */

    const careerMap = useMemo(
        () => new Map(careers.map((c) => [c.id, c])),
        [careers]
    );

    const regMap = useMemo(() => {
        const map = new Map<string, Registration[]>();

        registrations.forEach((r) => {
            if (!r.student_id) return;

            map.set(r.student_id, [
                ...(map.get(r.student_id) ?? []),
                r,
            ]);
        });

        return map;
    }, [registrations]);

    /* ---------------- FILTER LOGIC (FRONTEND REAL) ---------------- */

    const filteredUsers = useMemo(() => {
        return allUsers.filter((user) => {
            const roleOk =
                !filterValues.role ||
                normalizeRole(user.role) ===
                    filterValues.role;

            const activeOk =
                filterValues.is_active === undefined ||
                filterValues.is_active === "" ||
                String(user.is_active) ===
                    filterValues.is_active;

            const careerOk =
                !filterValues.career_id ||
                resolveCareers(user, regMap, careerMap).some(
                    (c) =>
                        careerMap.get(filterValues.career_id)
                            ?.name === c
                );

            const searchOk =
                !search ||
                getFullName(user)
                    .toLowerCase()
                    .includes(search.toLowerCase());

            return roleOk && activeOk && careerOk && searchOk;
        });
    }, [
        allUsers,
        filterValues,
        search,
        regMap,
        careerMap,
    ]);

    /* ---------------- TABLE DATA ---------------- */

    const tableData = useMemo(
        () =>
            filteredUsers
                .filter(isVisibleUser)
                .map((u) =>
                    buildRow(u, regMap, careerMap)
                ),
        [filteredUsers, regMap, careerMap]
    );

    /* ---------------- HANDLERS ---------------- */

    const handleFilterChange = (
        key: string,
        value: string
    ) => {
        setFilterValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleClear = () => {
        setSearch("");
        setFilterValues({});
    };

    const deactivateUser = async (id: string): Promise<boolean> => {
        const updated = await userService.deactivate(id);

        if (!updated) return false;

        setAllUsers((current) =>
            current.map((user) =>
                user.id === id
                    ? {
                        ...user,
                        is_active: false,
                    }
                    : user
            )
        );

        return true;
    };

    const activateUser = async (id: string): Promise<boolean> => {
        const updated = await userService.activate(id);

        if (!updated) return false;

        setAllUsers((current) =>
            current.map((user) =>
                user.id === id
                    ? {
                        ...user,
                        is_active: true,
                    }
                    : user
            )
        );

        return true;
    };

    return {
        activateUser,
        careers,
        deactivateUser,
        filterValues,
        handleFilterChange,
        handleClear,
        setSearch,
        tableData,
    };
};
