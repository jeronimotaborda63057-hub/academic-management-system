import { Link } from 'react-router-dom';
import DarkModeSwitcher from './DarkModeSwitcher';
import PageHeader from './PageHeader';

const Header = (props: {
    sidebarOpen: string | boolean | undefined;
    setSidebarOpen: (arg0: boolean) => void;
    title?: string;        
    description?: string;
}) => {
    return (
        <header className="sticky top-0 z-999 w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
            <div className="flex h-14 w-full items-center justify-between px-4 md:px-6 2xl:px-8">

                {/* Botón hamburguesa (mobile) */}
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                    <button
                        aria-controls="sidebar"
                        onClick={(e) => {
                            e.stopPropagation();
                            props.setSidebarOpen(!props.sidebarOpen);
                        }}
                        className="z-99999 block rounded-sm border border-stroke bg-white p-1 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
                    >
                        <span className="relative block h-5.5 w-5.5 cursor-pointer">
                            <span className="du-block absolute right-0 h-full w-full">
                                <span className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!w-full delay-300'}`}></span>
                                <span className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && 'delay-400 !w-full'}`}></span>
                                <span className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!w-full delay-500'}`}></span>
                            </span>
                            <span className="absolute right-0 h-full w-full rotate-45">
                                <span className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!h-0 !delay-[0]'}`}></span>
                                <span className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!h-0 !delay-200'}`}></span>
                            </span>
                        </span>
                    </button>
                    <Link className="block flex-shrink-0 lg:hidden" to="/" />
                </div>

                {/* Título y descripción */}
                <div className="hidden sm:flex sm:items-center">
                    <PageHeader
                        title={props.title ?? 'Dashboard'}
                        subtitle={props.description ?? 'Bienvenido al sistema de gestión académica'}
                    />
                </div>

                {/* Dark mode */}
                <div className="flex items-center gap-3 2xsm:gap-7">
                    <ul className="flex items-center gap-2 2xsm:gap-4">
                        <DarkModeSwitcher />
                    </ul>
                </div>

            </div>
        </header>
    );
};

export default Header;