import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import PageHeader from "../ui/PageHeader";
import type { RootState } from "../../store/store";
import UserIdentity from "./UserIdentity";

interface HeaderProps {
    sidebarOpen: string | boolean | undefined;
    setSidebarOpen: (value: boolean) => void;
    title?: string;
    description?: string;
}

const Header = ({
    sidebarOpen,
    setSidebarOpen,
    title,
    description,
}: HeaderProps) => {
    const user = useSelector((state: RootState) => state.user.user);

    return (
        <header className="sticky top-0 z-999 w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
            <div className="flex h-14 w-full items-center justify-between px-4 md:px-6 2xl:px-8">
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                    <button
                        aria-controls="sidebar"
                        onClick={(event) => {
                            event.stopPropagation();
                            setSidebarOpen(!sidebarOpen);
                        }}
                        className="z-99999 block rounded-sm border border-stroke bg-white p-1 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
                    >
                        <span className="relative block h-5.5 w-5.5 cursor-pointer">
                            <span className="du-block absolute right-0 h-full w-full">
                                <span
                                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                                        !sidebarOpen && "!w-full delay-300"
                                    }`}
                                />
                                <span
                                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                                        !sidebarOpen && "delay-400 !w-full"
                                    }`}
                                />
                                <span
                                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                                        !sidebarOpen && "!w-full delay-500"
                                    }`}
                                />
                            </span>
                            <span className="absolute right-0 h-full w-full rotate-45">
                                <span
                                    className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                                        !sidebarOpen && "!h-0 !delay-[0]"
                                    }`}
                                />
                                <span
                                    className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                                        !sidebarOpen && "!h-0 !delay-200"
                                    }`}
                                />
                            </span>
                        </span>
                    </button>
                    <Link className="block flex-shrink-0 lg:hidden" to="/" />
                </div>

                <div className="hidden sm:flex sm:items-center">
                    <PageHeader
                        title={title ?? ""}
                        subtitle={description ?? "Bienvenido al sistema de gestion academica"}
                    />
                </div>

                <UserIdentity user={user} />
            </div>
        </header>
    );
};

export default Header;
