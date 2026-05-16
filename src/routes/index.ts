import { lazy } from 'react';

const UsersList = lazy(() => import('../pages/users/List'));
const UsersCreate = lazy(() => import('../pages/users/Create'));
const UsersEdit = lazy(() => import('../pages/users/Edit'));
const CareersList = lazy(() => import('../pages/careers/List'));
const CareersCreate = lazy(() => import('../pages/careers/Create'));
const CareersEdit = lazy(() => import('../pages/careers/Edit'));
const SemestersList = lazy(() => import('../pages/semesters/List'));
const SemestersCreate = lazy(() => import('../pages/semesters/Create'));
const SemestersEdit = lazy(() => import('../pages/semesters/Edit'));
const CurriculumList = lazy(() => import('../pages/study-plan/List'));
const AssignTeacherPage = lazy(() => import('../pages/groups/AssignTeacherPage') )
const SubjectsList = lazy(() => import('../pages/subjects/List'));
const SubjectsCreate = lazy(() => import('../pages/subjects/Create'));
const SubjectsEdit = lazy(() => import('../pages/subjects/Edit'));
const ScaleDefinitionPage = lazy(() => import('../pages/rubrics/RubricScaleDefinitionPage'));
const StudentsList = lazy(() => import('../pages/students/List'));
const EnrollmentList = lazy(() => import('../pages/enrollments/List'));
const EnrollmentCreate = lazy(()=> import('../pages/enrollments/Create'));
const EnrollmentEdit = lazy(() => import('../pages/enrollments/Edit'));
const EvaluationsList = lazy(() => import('../pages/evaluations/List'));
const GradesList = lazy(() => import('../pages/grades/List'));
const RubricConsultationList = lazy(() => import('../pages/rubrics/RubricConsultationListPage'));
const RubricConsultation = lazy(() => import('../pages/rubrics/RubricConsultationPage'));
const GradeDetails = lazy(() => import('../pages/grades/Details'));

const coreRoutes = [
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
        component : StudentsList
    },
    {
        path: 'enrollments/list',
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
        path: '/groups/assign-teacher',
        title: 'Asignar docente a grupo',
        component: AssignTeacherPage
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
        path: '/rubrics/list',
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
