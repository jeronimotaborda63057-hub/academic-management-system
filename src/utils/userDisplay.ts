import type { User } from "../models/User";

export const getUserDisplayName = (user: User | null): string => {
    if (!user) return "";

    if (user.display_name?.trim()) {
        return user.display_name.trim();
    }

    const profileName = [
        user.profile?.first_name,
        user.profile?.last_name,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    if (profileName) return profileName;

    return user.email.split("@")[0] || "Usuario";
};

export const getUserInitial = (user: User | null): string =>
    getUserDisplayName(user).charAt(0).toUpperCase() || "U";
