/**
 * routes/index.ts — CORREGIDO
 *
 * Cambios respecto al original:
 *  1. Eliminada la ruta /rubrics/scales duplicada (aparecía dos veces).
 *  2. Añadidos roles faltantes en rutas que cualquier usuario autenticado podía acceder:
 *     - /rubrics/*          → solo TEACHER
 *     - /users/*            → solo ADMIN
 *     - /careers/*          → solo ADMIN
 *     - /semesters/*        → solo ADMIN
 *     - /subjects/*         → solo ADMIN
 *     - /study-plans/list   → solo ADMIN
 *     - /groups/list|create|edit  → ADMIN
 *     - /groups/assign-teacher    → ADMIN
 *     - /enrollments/*      → ADMIN
 *     - /students/list      → ADMIN
 *     - /evaluations        → TEACHER
 *     - /grades/list|register → TEACHER
 *     - /grades/details     → STUDENT
 *     - /rubrics/consultations y evaluations → STUDENT
 *  3. Las rutas de detalle de admin (/admin/teachers, /admin/students/:id) ya tenían roles.
 */

import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { UserRole } from "../models/uml/User";

interface AppRoute {
  path: string;
  title: string;
  component: LazyExoticComponent<ComponentType>;
  roles?: UserRole[];
}

// ── Lazy imports ──────────────────────────────────────────────────────────────
const UsersList    = lazy(() => import("../pages/users/List"));
const UsersCreate  = lazy(() => import("../pages/users/Create"));
const UsersEdit    = lazy(() => import("../pages/users/Edit"));

const AdminTeachersList  = lazy(() => import("../pages/admin/TeachersList"));
const AdminTeacherDetail = lazy(() => import("../pages/admin/TeacherDetail"));
const AdminStudentDetail = lazy(() => import("../pages/admin/StudentDetail"));
const AdminCareerEnrollment = lazy(() => import("../pages/students/Enrollment"));

const StudentMySubjects = lazy(() => import("../pages/students/MySubjects"));

const CareersList  = lazy(() => import("../pages/careers/List"));
const CareersCreate = lazy(() => import("../pages/careers/Create"));
const CareersEdit   = lazy(() => import("../pages/careers/Edit"));

const SemestersList  = lazy(() => import("../pages/semesters/List"));
const SemestersCreate = lazy(() => import("../pages/semesters/Create"));
const SemestersEdit   = lazy(() => import("../pages/semesters/Edit"));

const CurriculumList = lazy(() => import("../pages/study-plan/List"));

const AssignTeacherPage = lazy(() => import("../pages/groups/AssignTeacherPage"));
const GroupsCreate = lazy(() => import("../pages/groups/Create"));
const GroupsEdit   = lazy(() => import("../pages/groups/Edit"));
const GroupsList   = lazy(() => import("../pages/groups/List"));

const SubjectsList  = lazy(() => import("../pages/subjects/List"));
const SubjectsCreate = lazy(() => import("../pages/subjects/Create"));
const SubjectsEdit   = lazy(() => import("../pages/subjects/Edit"));

const ScaleDefinitionPage = lazy(() => import("../pages/rubrics/RubricScaleDefinitionPage"));
const StudentsList         = lazy(() => import("../pages/students/List"));

const EnrollmentList   = lazy(() => import("../pages/enrollments/List"));
const EnrollmentCreate = lazy(() => import("../pages/enrollments/Create"));
const EnrollmentEdit   = lazy(() => import("../pages/enrollments/Edit"));

const EvaluationsList = lazy(() => import("../pages/evaluations/List"));

const GradesList             = lazy(() => import("../pages/grades/List"));
const GradeDetails           = lazy(() => import("../pages/grades/Details"));
const RegisterFinalGradePage = lazy(() => import("../pages/grades/RegisterFinalGradePage"));

const RubricConsultationList = lazy(() => import("../pages/rubrics/RubricConsultationListPage"));
const RubricConsultation     = lazy(() => import("../pages/rubrics/RubricConsultationPage"));

const RubricsList  = lazy(() => import("../pages/rubrics/List"));
const RubricsCreate = lazy(() => import("../pages/rubrics/Create"));
const RubricsEdit   = lazy(() => import("../pages/rubrics/Edit"));

const TeacherMyGroups    = lazy(() => import("../pages/teachers/MyGroups"));
const TeacherGroupsPage  = lazy(() => import("../pages/groups/TeacherGroupsPage"));
const AssociateRubricPage = lazy(() => import("../pages/evaluations/AssociateRubricPage"));

// ── Rutas ─────────────────────────────────────────────────────────────────────
const coreRoutes: AppRoute[] = [
  // ── Rúbricas (TEACHER) ────────────────────────────────────────────────────
  { path: "/rubrics/list",              title: "Rúbricas",                component: RubricsList,         roles: ["TEACHER"] },
  { path: "/rubrics/create",            title: "Crear rúbrica",           component: RubricsCreate,       roles: ["TEACHER"] },
  { path: "/rubrics/edit/:id",          title: "Editar rúbrica",          component: RubricsEdit,         roles: ["TEACHER"] },
  { path: "/rubrics/associate",         title: "Asociar rúbrica",         component: AssociateRubricPage, roles: ["TEACHER"] },
  { path: "/rubrics/scales",            title: "Criterios y escalas",     component: ScaleDefinitionPage, roles: ["TEACHER"] },

  // ── Consulta rúbricas (STUDENT) ───────────────────────────────────────────
  { path: "/rubrics/consultations",          title: "Mis evaluaciones",  component: RubricConsultationList, roles: ["STUDENT"] },
  { path: "/rubrics/evaluations/:evaluationId", title: "Consultar rúbrica", component: RubricConsultation,  roles: ["STUDENT"] },

  // ── Usuarios (ADMIN) ──────────────────────────────────────────────────────
  { path: "/users/list",   title: "Usuarios",        component: UsersList,   roles: ["ADMIN"] },
  { path: "/users/create", title: "Crear usuario",   component: UsersCreate, roles: ["ADMIN"] },
  { path: "/users/edit/:id", title: "Editar usuario", component: UsersEdit,  roles: ["ADMIN"] },

  // ── Detalle docente / estudiante (ADMIN) ──────────────────────────────────
  { path: "/admin/teachers",     title: "Docentes",          component: AdminTeachersList,   roles: ["ADMIN"] },
  { path: "/admin/teachers/:id", title: "Detalle docente",   component: AdminTeacherDetail,  roles: ["ADMIN"] },
  { path: "/admin/students/:id", title: "Detalle estudiante",component: AdminStudentDetail,  roles: ["ADMIN"] },
  { path: "/students/:id",       title: "Detalle estudiante",component: AdminStudentDetail,  roles: ["ADMIN", "TEACHER"] },
  { path: "/admin/enrollment",   title: "Matricular estudiante", component: AdminCareerEnrollment, roles: ["ADMIN"] },

  // ── Carreras (ADMIN) ──────────────────────────────────────────────────────
  { path: "/careers/list",    title: "Carreras",       component: CareersList,   roles: ["ADMIN"] },
  { path: "/careers/create",  title: "Crear carrera",  component: CareersCreate, roles: ["ADMIN"] },
  { path: "/careers/edit/:id",title: "Editar carrera", component: CareersEdit,   roles: ["ADMIN"] },

  // ── Semestres (ADMIN) ─────────────────────────────────────────────────────
  { path: "/semesters/list",    title: "Semestres",       component: SemestersList,   roles: ["ADMIN"] },
  { path: "/semesters/create",  title: "Crear semestre",  component: SemestersCreate, roles: ["ADMIN"] },
  { path: "/semesters/edit/:id",title: "Editar semestre", component: SemestersEdit,   roles: ["ADMIN"] },

  // ── Plan de estudios (ADMIN) ──────────────────────────────────────────────
  { path: "/study-plans/list", title: "Plan de estudios", component: CurriculumList, roles: ["ADMIN"] },

  // ── Asignaturas (ADMIN) ───────────────────────────────────────────────────
  { path: "/subjects/list",    title: "Asignaturas",       component: SubjectsList,   roles: ["ADMIN"] },
  { path: "/subjects/create",  title: "Crear asignatura",  component: SubjectsCreate, roles: ["ADMIN"] },
  { path: "/subjects/edit/:id",title: "Editar asignatura", component: SubjectsEdit,   roles: ["ADMIN"] },

  // ── Estudiantes (ADMIN) ───────────────────────────────────────────────────
  { path: "/students/list", title: "Estudiantes", component: StudentsList, roles: ["ADMIN", "TEACHER"] },

  // ── Matrículas / inscripciones (ADMIN) ────────────────────────────────────
  { path: "/enrollments/list",    title: "Matrículas",       component: EnrollmentList,   roles: ["ADMIN"] },
  { path: "/enrollments/create",  title: "Crear matrícula",  component: EnrollmentCreate, roles: ["ADMIN"] },
  { path: "/enrollments/edit/:id",title: "Editar matrícula", component: EnrollmentEdit,   roles: ["ADMIN"] },

  // ── Grupos (ADMIN) ────────────────────────────────────────────────────────
  { path: "/groups/list",           title: "Grupos",              component: GroupsList,        roles: ["ADMIN"] },
  { path: "/groups/create",         title: "Crear grupo",         component: GroupsCreate,      roles: ["ADMIN"] },
  { path: "/groups/edit/:id",       title: "Editar grupo",        component: GroupsEdit,        roles: ["ADMIN"] },
  { path: "/groups/assign-teacher", title: "Asignar docente",     component: AssignTeacherPage, roles: ["ADMIN"] },

  // ── Grupos del docente (TEACHER) ──────────────────────────────────────────
  { path: "/groups/teacher",  title: "Mis grupos", component: TeacherGroupsPage, roles: ["TEACHER"] },
  { path: "/teacher/my-groups", title: "Mis grupos", component: TeacherMyGroups, roles: ["TEACHER"] },

  // ── Evaluaciones y calificaciones (TEACHER) ───────────────────────────────
  { path: "/evaluations",          title: "Evaluaciones",      component: EvaluationsList,        roles: ["TEACHER"] },
  { path: "/grades/list",          title: "Notas finales",     component: GradesList,             roles: ["TEACHER"] },
  { path: "/grades/register",      title: "Registrar nota",    component: RegisterFinalGradePage, roles: ["TEACHER"] },
  { path: "/grades/register/:groupId", title: "Registrar nota", component: RegisterFinalGradePage, roles: ["TEACHER"] },

  // ── Calificaciones del estudiante (STUDENT) ───────────────────────────────
  { path: "/student/my-subjects", title: "Mis asignaturas",   component: StudentMySubjects, roles: ["STUDENT"] },
  { path: "/grades/details",      title: "Mis calificaciones", component: GradeDetails,      roles: ["STUDENT"] },
];

const routes = [...coreRoutes];
export default routes;
