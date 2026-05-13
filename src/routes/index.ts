import { lazy } from 'react';

const Demo = lazy(() => import('../pages/Demo'));
const UsersList = lazy(() => import('../pages/Users/List'));
const UsersCreate = lazy(() => import('../pages/Users/Create'));
const UsersEdit = lazy(() => import('../pages/Users/Edit'));
const CareersList = lazy(() => import('../pages/Careers/List'));
const CareersCreate = lazy(() => import('../pages/Careers/Create'));
const CareersEdit = lazy(() => import('../pages/Careers/Edit'));
const SemestersList = lazy(() => import('../pages/Semesters/List'));
const SemestersCreate = lazy(() => import('../pages/Semesters/Create'));
const SemestersEdit = lazy(() => import('../pages/Semesters/Edit'));
const CurriculumList = lazy(() => import('../pages/Study-Plan/List'))
const AssignTeacherPage = lazy(() => import('../pages/Groups/AssignTeacherPage'))

const coreRoutes = [
    {
        path: '/demo',
        title: 'Demo',
        component: Demo
    },
    { 
        path: '/users/list', 
        title: 'Usuarios', 
        component: UsersList 
    },
    { 
        path: '/users/create', 
        title: 'Crear usuario', 
        component: UsersCreate 
    },
    { 
        path: '/users/edit/:id', 
        title: 'Editar usuario', 
        component: UsersEdit 
    },
    { 
        path: '/careers/list', 
        title: 'Carreras', 
        component: CareersList 
    },
    { 
        path: '/careers/create', 
        title: 'Crear carrera', 
        component: CareersCreate 
    },
    { 
        path: '/careers/edit/:id', 
        title: 'Editar carrera', 
        component: CareersEdit 
    },
    { 
        path: '/semesters/list', 
        title: 'Semestres', 
        component: SemestersList 
    },
    { 
        path: '/semesters/create', 
        title: 'Crear semestre', 
        component: SemestersCreate 
    },
    { 
        path: '/semesters/edit/:id', 
        title: 'Editar semestre', 
        component: SemestersEdit 
    },
    {
        path: '/study-plans/list',
        title: 'Lista plan de estudios',
        component: CurriculumList
    },
    {
        path: '/groups/assign-teacher',
        title: 'Asignar docente a grupo',
        component: AssignTeacherPage
    }
];

const routes = [...coreRoutes];
export default routes;