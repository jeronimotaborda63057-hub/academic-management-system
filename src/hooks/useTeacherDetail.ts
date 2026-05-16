import { useEffect, useState } from "react";

import type { Group } from "../models/Group";
import type { TeacherProfile } from "../models/TeacherProfile";
import type { User } from "../models/User";
import { groupService } from "../services/groupService";
import { userService } from "../services/userService";

export const getTeacherProfile = (user?: User | null): TeacherProfile | undefined => {
    const profile = user?.profile;
    if (!profile || !("first_name" in profile) || !("last_name" in profile)) return undefined;
    return profile as TeacherProfile;
};

export const getTeacherFullName = (user?: User | null): string => {
    const profile = getTeacherProfile(user);
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
    return fullName || user?.code || user?.email || "Docente";
};

export const useTeacherDetail = (teacherUserId?: string) => {
    const [teacher, setTeacher] = useState<User | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTeacher = async () => {
            if (!teacherUserId) {
                setLoading(false);
                setError("No se recibio el docente solicitado.");
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const teacherData = await userService.getById(teacherUserId);
                setTeacher(teacherData);

                const teacherProfileId = getTeacherProfile(teacherData)?.id ?? teacherData?.id;
                const teacherGroups = teacherProfileId
                    ? await groupService.getByTeacher(teacherProfileId)
                    : [];

                setGroups(teacherGroups);
            } catch {
                setError("No fue posible cargar el detalle del docente.");
            } finally {
                setLoading(false);
            }
        };

        loadTeacher();
    }, [teacherUserId]);

    return {
        error,
        groups,
        loading,
        teacher,
        teacherName: getTeacherFullName(teacher),
        teacherProfile: getTeacherProfile(teacher),
    };
};
