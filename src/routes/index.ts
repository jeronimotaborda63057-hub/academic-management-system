import { lazy } from 'react';

const Demo      = lazy(() => import('../pages/Demo'));
const UsersList = lazy(() => import('../pages/users/List'));
const UsersCreate = lazy(() => import('../pages/users/Create'));
const UsersEdit   = lazy(() => import('../pages/users/Edit'));

const coreRoutes = [
    { path: '/demo',             title: 'Demo',           component: Demo        },
    { path: '/users/list',       title: 'Usuarios',       component: UsersList   },
    { path: '/users/create',     title: 'Crear usuario',  component: UsersCreate },
    { path: '/users/edit/:id',   title: 'Editar usuario', component: UsersEdit   },
]

const routes = [...coreRoutes];
export default routes;