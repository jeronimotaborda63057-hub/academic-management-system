import { lazy } from 'react';
import CardPrueba from '../components/CardPrueba';

const Demo = lazy(() => import('../pages/Demo'));

const coreRoutes = [
    {
        path: '/demo',
        title: 'Demo',
        component: Demo,
    },
    {
        label: 'Calendar',
        path: '/calendar',
        component: Demo,
    },
    {
        label: 'Profile',
        path: '/profile',
        component: Demo,
    },
    {
        label: 'Tables',
        path: '/tables',
        component: Demo,
    },
    {
        label: 'Settings',
        path: '/settings',
        component: CardPrueba,
    },

    /* { 
        path: "/",
        title: "Inicio", 
        // component: HomePage,
    },
    { 
        path: "/users",
        title: "Usuarios", 
        // component:
    },
    { 
        
        path: "/careers",
        title: "Carreras", 
        // component:
    },
    { 
        path: "/semesters",
        title: "Semestres", 
        // component:
    },
    { 
        path: "/subjects",
        title: "Asignaturas", 
        // component:
    },
    { 
        path: "/groups",
        title: "Grupos", 
        // component:
    },
    { 
        path: "/enrollments",
        title: "Matrículas", 
        // component:
    },
    { 
        path: "/register",
        title: "Reportes", 
        // component:
    },
    { 
        path: "/auditory",
        title: "Auditoría", 
        // component:
    },
    { 
        path: "/configuration",
        title: "Configuración", 
        // component:
    }, */

]

const routes = [...coreRoutes];
export default routes;