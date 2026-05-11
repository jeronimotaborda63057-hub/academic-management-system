import { lazy } from 'react';

const Demo = lazy(() => import('../pages/Demo'));
const UsersList = lazy(() => import('../pages/users/List'));
const UsersCreate = lazy(() => import('../pages/users/Create'));
const UsersEdit = lazy(() => import('../pages/users/Edit'));
const CareersList = lazy(() => import('../pages/careers/List'));
const SemestersList = lazy(() => import('../pages/semesters/List'));

const coreRoutes = [
    { path: '/demo', title: 'Demo', component: Demo },
    { path: '/users/list', title: 'Usuarios', component: UsersList },
    { path: '/users/create', title: 'Crear usuario', component: UsersCreate },
    { path: '/users/edit/:id', title: 'Editar usuario', component: UsersEdit },
    { path: '/careers/list', title: 'Carreras', component: CareersList },
    { path: '/semesters/list', title: 'Semestres', component: SemestersList },
]

const routes = [...coreRoutes];
export default routes;