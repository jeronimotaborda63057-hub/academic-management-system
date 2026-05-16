import { useSelector } from "react-redux";

import type { RootState } from "../../store/store";
import type { User } from "../../models/User";
import { UserSwitcher } from "../../components/UserSwitcher";

const getDisplayName = (user: User | null) => {
    if (!user) return "usuario";

    if (user.role === "ADMIN") {
        return user.code || "administrador";
    }

    const fullName = [
        user.profile?.first_name,
        user.profile?.last_name,
    ].filter(Boolean).join(" ");

    return fullName || user.code || user.email;
};

const Home = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const displayName = getDisplayName(user);

    return (
        <section className="flex min-h-[60vh] items-center">
            <div className="w-full">
                <h1 className="max-w-4xl text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                    Bienvenido, {displayName}.
                </h1>
                <p className="mt-4 max-w-2xl text-base text-gray-500">
                    Gestiona tus actividades academicas desde el menú principal.
                </p>
            </div>
            <UserSwitcher></UserSwitcher>
        </section>
    );
};

export default Home;
