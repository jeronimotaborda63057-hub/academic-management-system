import type { User } from "../../models/uml/User";
import { getUserDisplayName, getUserInitial } from "../../utils/userDisplay";

interface UserIdentityProps {
    user: User | null;
}

const UserIdentity = ({ user }: UserIdentityProps) => {
    const displayName = getUserDisplayName(user);
    const initial = getUserInitial(user);

    return (
        <div className="ml-auto flex items-center gap-3">
            <div className="hidden flex-col items-end leading-tight sm:flex">
                <span className="text-sm font-semibold text-black dark:text-white">
                    {displayName}
                </span>
                <span className="text-xs text-gray-500 dark:text-bodydark2">
                    {user?.email}
                </span>
            </div>

            {user?.photo_url ? (
                <img
                    src={user.photo_url}
                    alt={displayName}
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-primary">
                    {initial}
                </div>
            )}
        </div>
    );
};

export default UserIdentity;
