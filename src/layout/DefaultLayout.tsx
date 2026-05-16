import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store';

const DefaultLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Provider store={store}>
            {/* ✅ bg blanco en light, oscuro en dark */}
            <div className="bg-white dark:bg-boxdark-2 dark:text-bodydark min-h-screen">
                <div className="relative flex h-screen overflow-hidden">
                    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                        <div className="sticky top-0 z-10">
                            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                        </div>
                        <main className="flex-1 bg-gray-50 dark:bg-boxdark-2">
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
