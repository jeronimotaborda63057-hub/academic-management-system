/**
 * routes/index.ts
 *
 * Registro central de rutas lazy-loaded.
 *
 * Patrón de extensión (OCP):
 * Para agregar un módulo nuevo solo se agregan entradas al array coreRoutes.
 * No se modifica App.tsx ni ningún otro archivo.
 */
import { lazy } from 'react';

// ── Demo ──────────────────────────────────────────────────────────────────────
const Demo = lazy(() => import('../pages/Demo'));

// ── Usuarios (HU-01 — completo) ───────────────────────────────────────────────
const UsersList   = lazy(() => import('../pages/Users/List'));
const UsersCreate = lazy(() => import('../pages/Users/Create'));
const UsersEdit   = lazy(() => import('../pages/Users/Edit'));

// ── Carreras (HU-02 — nuevo) ──────────────────────────────────────────────────
const CareersList   = lazy(() => import('../pages/Careers/List'));
const CareersCreate = lazy(() => import('../pages/Careers/Form'));
const CareersEdit   = lazy(() => import('../pages/Careers/Form'));

// ── Semestres (HU-02 — nuevo) ─────────────────────────────────────────────────
const SemestersList   = lazy(() => import('../pages/Semesters/List'));
const SemestersCreate = lazy(() => import('../pages/Semesters/Form'));
const SemestersEdit   = lazy(() => import('../pages/Semesters/Form'));

const coreRoutes = [
    { path: '/demo',               title: 'Demo',             component: Demo            },

    // Usuarios
    { path: '/users/list',         title: 'Usuarios',         component: UsersList       },
    { path: '/users/create',       title: 'Crear usuario',    component: UsersCreate     },
    { path: '/users/edit/:id',     title: 'Editar usuario',   component: UsersEdit       },

    // Carreras
    { path: '/careers/list',       title: 'Carreras',         component: CareersList     },
    { path: '/careers/create',     title: 'Nueva carrera',    component: CareersCreate   },
    { path: '/careers/edit/:id',   title: 'Editar carrera',   component: CareersEdit     },

    // Semestres
    { path: '/semesters/list',     title: 'Semestres',        component: SemestersList   },
    { path: '/semesters/create',   title: 'Nuevo semestre',   component: SemestersCreate },
    { path: '/semesters/edit/:id', title: 'Editar semestre',  component: SemestersEdit   },
];

const routes = [...coreRoutes];
export default routes;