import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store';
const DefaultLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Provider store={store}>
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
                <div className="flex h-screen overflow-hidden">
                    {/* Sidebar — ya es fijo por h-screen */}
                    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                    {/* Área de contenido */}
                    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">

                        {/* ✅ CAMBIO 1: sticky top-0 z-10 para que el header no se mueva */}
                        <div className="sticky top-0 z-10">
                            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                        </div>

                        {/* ✅ CAMBIO 2: flex-1 para que el main ocupe el resto y scrollee */}
                        <main className="flex-1">
                            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                                <Outlet />
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </Provider>
    );
};

export default DefaultLayout;
