import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { UserRole } from '../models/User';

interface AppRoute {
    path: string;
    title: string;
    component: LazyExoticComponent<ComponentType>;
    roles?: UserRole[];
}

const UsersList = lazy(() => import('../pages/users/List'));
const UsersCreate = lazy(() => import('../pages/users/Create'));
const UsersEdit = lazy(() => import('../pages/users/Edit'));
const AdminTeachersList = lazy(() => import('../pages/admin/TeachersList'));
const AdminTeacherDetail = lazy(() => import('../pages/admin/TeacherDetail'));
const AdminCareerEnrollment = lazy(() => import('../pages/students/Enrollment'));
const StudentMySubjects = lazy(() => import('../pages/students/MySubjects'));
const CareersList = lazy(() => import('../pages/careers/List'));
const CareersCreate = lazy(() => import('../pages/careers/Create'));
const CareersEdit = lazy(() => import('../pages/careers/Edit'));
const SemestersList = lazy(() => import('../pages/semesters/List'));
const SemestersCreate = lazy(() => import('../pages/semesters/Create'));
const SemestersEdit = lazy(() => import('../pages/semesters/Edit'));
const CurriculumList = lazy(() => import('../pages/study-plan/List'));
const AssignTeacherPage = lazy(() => import('../pages/groups/AssignTeacherPage'));
const GroupsCreate = lazy(() => import('../pages/groups/Create'));
const GroupsEdit = lazy(() => import('../pages/groups/Edit'));
const GroupsList = lazy(() => import('../pages/groups/List'));
const SubjectsList = lazy(() => import('../pages/subjects/List'));
const SubjectsCreate = lazy(() => import('../pages/subjects/Create'));
const SubjectsEdit = lazy(() => import('../pages/subjects/Edit'));
const ScaleDefinitionPage = lazy(() => import('../pages/rubrics/RubricScaleDefinitionPage'));
const StudentsList = lazy(() => import('../pages/students/List'));
const EnrollmentList = lazy(() => import('../pages/enrollments/List'));
const EnrollmentCreate = lazy(() => import('../pages/enrollments/Create'));
const EnrollmentEdit = lazy(() => import('../pages/enrollments/Edit'));
const EvaluationsList = lazy(() => import('../pages/evaluations/List'));
const GradesList = lazy(() => import('../pages/grades/List'));
const RubricConsultationList = lazy(() => import('../pages/rubrics/RubricConsultationListPage'));
const RubricConsultation = lazy(() => import('../pages/rubrics/RubricConsultationPage'));
const GradeDetails = lazy(() => import('../pages/grades/Details'));

// ── HU-08: Rúbricas ───────────────────────────────────────────────────────────
const RubricsList = lazy(() => import('../pages/rubrics/List'));
const RubricsCreate = lazy(() => import('../pages/rubrics/Create'));
const RubricsEdit = lazy(() => import('../pages/rubrics/Edit'));

// ── CU-12: Registrar nota final ───────────────────────────────────────────────
const RegisterFinalGradePage = lazy(() => import('../pages/grades/RegisterFinalGradePage'));
const TeacherGroupsPage = lazy(() => import('../pages/groups/TeacherGroupsPage'));
const TeacherMyGroups = lazy(() => import('../pages/teachers/MyGroups'));
const AssociateRubricPage = lazy(() => import('../pages/evaluations/AssociateRubricPage'));

const coreRoutes: AppRoute[] = [
    // ── Rúbricas (HU-08) ──────────────────────────────────────────────────────
    {
        path: '/rubrics/list',
        title: 'Rúbricas',
        component: RubricsList
    },
    {
        path: '/rubrics/create',
        title: 'Crear rúbrica',
        component: RubricsCreate
    },
    {
        path: '/rubrics/edit/:id',
        title: 'Editar rúbrica',
        component: RubricsEdit
    },
    {
        path: '/rubrics/associate',
        title: 'Asociar rúbrica a evaluación',
        component: AssociateRubricPage,
        roles: ["TEACHER"]
    },
    {
        path: '/rubrics/scales',
        title: 'Definir criterios y escalas',
        component: ScaleDefinitionPage
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
        path: '/admin/teachers',
        title: 'Docentes',
        component: AdminTeachersList,
        roles: ["ADMIN"]
    },
    {
        path: '/admin/teachers/:id',
        title: 'Detalle docente',
        component: AdminTeacherDetail,
        roles: ["ADMIN"]
    },
    {
        path: '/admin/enrollment',
        title: 'Matricular estudiante en carrera',
        component: AdminCareerEnrollment,
        roles: ["ADMIN"]
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
        path: '/subjects/list',
        title: 'Asignaturas',
        component: SubjectsList
    },
    {
        path: '/subjects/create',
        title: 'Crear asignatura',
        component: SubjectsCreate
    },
    {
        path: '/subjects/edit/:id',
        title: 'Editar asignatura',
        component: SubjectsEdit
    },
    {
        path: '/students/list',
        title: 'Estudiantes',
        component: StudentsList
    },
    {
        path: '/enrollments/list',
        title: 'Asignar matrícula',
        component: EnrollmentList
    },
    {
        path: '/enrollments/create',
        title: 'Crear matrícula',
        component: EnrollmentCreate
    },
    {
        path: '/enrollments/edit/:id',
        title: 'Editar matrícula',
        component: EnrollmentEdit
    },
    {
        path: '/groups/list',
        title: 'Grupos',
        component: GroupsList
    },
    {
        path: '/groups/create',
        title: 'Crear grupo',
        component: GroupsCreate
    },
    {
        path: '/groups/edit/:id',
        title: 'Editar grupo',
        component: GroupsEdit
    },
    {
        path: '/groups/assign-teacher',
        title: 'Asignar docente a grupo',
        component: AssignTeacherPage
    },
    {
        path: '/groups/teacher',
        title: 'Mis grupos',
        component: TeacherGroupsPage
    },
    {
        path: "/teacher/my-groups",
        title: 'Mis grupos',
        component: TeacherMyGroups,
        roles: ["TEACHER"]
    },
    {
        path: '/student/my-subjects',
        title: 'Mis asignaturas',
        component: StudentMySubjects,
        roles: ["STUDENT"]
    },

    // ── CU-12: Registrar nota final ───────────────────────────────────────────
    {
        path: '/rubrics/scales',
        title: 'Definir criterios y escalas',
        component: ScaleDefinitionPage
    },
    {
        path: '/evaluations',
        title: 'Evaluaciones',
        component: EvaluationsList
    },
    {
        path: '/evaluations/list',
        title: 'Evaluaciones',
        component: EvaluationsList
    },
    {
        path: '/grades/list',
        title: 'Notas finales',
        component: GradesList
    },
    {
        path: '/grades/register',
        title: 'Registrar nota final',
        component: RegisterFinalGradePage
    },
    {
        path: '/grades/register/:groupId',
        title: 'Registrar nota final',
        component: RegisterFinalGradePage
    },
    {
        path: '/rubrics/consultations',
        title: 'Mis evaluaciones',
        component: RubricConsultationList
    },
    {
        path: '/rubrics/evaluations/:evaluationId',
        title: 'Consultar rubrica',
        component: RubricConsultation,
    },
    {
        path: '/grades/details',
        title: 'Mis calificaciones',
        component: GradeDetails
    },
];

const routes = [...coreRoutes];
export default routes;
