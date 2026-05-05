import { lazy } from 'react';

const Demo = lazy(() => import('../pages/Demo'));

const coreRoutes = [
    {
        path: '/demo',
        title: 'Demo',
        component: Demo,
    }
]

const routes = [...coreRoutes];
export default routes;