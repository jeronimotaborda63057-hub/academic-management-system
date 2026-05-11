# EduGest

Sistema académico orientado a la gestión de rúbricas, evaluaciones y seguimiento académico en entornos universitarios.

## Descripción General

EduGest Frontend es una aplicación web desarrollada para centralizar los procesos académicos relacionados con:

* Gestión de usuarios académicos.
* Administración de carreras y asignaturas.
* Configuración de planes de estudio.
* Gestión de grupos y matrículas.
* Creación y administración de rúbricas.
* Evaluación de estudiantes.
* Consulta de calificaciones y desempeño.

La plataforma está diseñada bajo una arquitectura modular enfocada en separación de responsabilidades, experiencia de usuario y escalabilidad visual, permitiendo una interacción clara entre administradores, docentes y estudiantes.

---

# Objetivo del Proyecto

Desarrollar una interfaz frontend académica que permita administrar procesos universitarios asociados a evaluación por rúbricas, facilitando el registro, consulta y seguimiento de información académica de manera estructurada y centralizada.

---

# Roles del Sistema

## Administrador

Responsable de la configuración académica y administrativa del sistema.

Funciones principales:

* Gestión de usuarios.
* Gestión de carreras.
* Administración de semestres.
* Gestión de asignaturas.
* Configuración del plan de estudios.
* Asignación de docentes.
* Matrícula de estudiantes.
* Inscripción de estudiantes en grupos.

---

## Docente

Responsable de la administración de evaluaciones y calificaciones.

Funciones principales:

* Creación de rúbricas.
* Definición de criterios y escalas.
* Asociación de rúbricas a evaluaciones.
* Calificación de estudiantes.
* Registro de notas finales.

---

## Estudiante

Responsable de consultar información académica asociada a su desempeño.

Funciones principales:

* Consulta de rúbricas.
* Visualización de calificaciones.
* Descarga de reportes.

---

# Características Funcionales

## Gestión de Usuarios

El sistema permite:

* Crear usuarios administrativos, docentes y estudiantes.
* Editar información de usuarios.
* Desactivar cuentas.
* Filtrar registros por estado, rol o carrera.
* Validar unicidad de correo institucional y código.

---

## Gestión Académica

Incluye módulos para:

* Administración de carreras.
* Configuración de semestres académicos.
* Gestión de asignaturas.
* Asociación de asignaturas a planes de estudio.
* Administración de cohortes.

Restricciones implementadas:

* No se permiten códigos duplicados.
* Solo puede existir un semestre activo por carrera.
* No pueden eliminarse carreras con estudiantes activos.

---

## Gestión de Matrículas e Inscripciones

El sistema permite:

* Matricular estudiantes en carreras.
* Inscribir estudiantes en grupos académicos.
* Validar pertenencia de asignaturas al plan de estudios.
* Evitar inscripciones duplicadas.

---

## Gestión de Rúbricas

Los docentes pueden:

* Crear rúbricas asociadas a asignaturas.
* Configurar criterios de evaluación.
* Asignar pesos porcentuales.
* Definir escalas de desempeño.
* Guardar borradores.
* Publicar rúbricas.

Reglas de negocio:

* Los criterios deben sumar exactamente 100%.
* Una rúbrica publicada no puede eliminarse.
* Cada criterio puede contener entre 2 y 5 niveles de escala.

---

## Gestión de Evaluaciones

El módulo de evaluación permite:

* Asociar rúbricas a evaluaciones.
* Calificar estudiantes por criterio.
* Registrar comentarios personalizados.
* Calcular automáticamente notas ponderadas.
* Registrar notas finales oficiales.
* Generar reportes descargables.

---

## Consulta Académica

Los estudiantes pueden:

* Visualizar rúbricas publicadas.
* Consultar criterios y escalas.
* Revisar desempeño por evaluación.
* Ver comentarios del docente.
* Descargar reportes académicos.

---

# Arquitectura Frontend

La aplicación frontend se encuentra organizada bajo una estructura modular basada en componentes reutilizables.

## Estructura General

```bash
src/
│── assets/
│── common/
├── components/
│── hooks/
│── interceptors/
├── layout/
├── models/
├── pages/
├── routes/
├── services/
├── storage/
├── store/
```

---

# Flujo General del Sistema

## Administrador

1. Gestiona usuarios.
2. Configura carreras y asignaturas.
3. Habilita semestres.
4. Asigna docentes.
5. Matricula estudiantes.
6. Gestiona grupos académicos.

---

## Docente

1. Crea rúbricas.
2. Define criterios y escalas.
3. Asocia rúbricas a evaluaciones.
4. Califica estudiantes.
5. Publica notas finales.

---

## Estudiante

1. Consulta rúbricas.
2. Visualiza evaluaciones.
3. Revisa calificaciones.
4. Descarga reportes.

---

# Integración con Backend

El frontend se comunica con un servicio backend académico encargado de:

* Autenticación mediante Bearer Token.
* Gestión de entidades académicas.
* Persistencia de datos.
* Validación de reglas de negocio.
* Exposición de endpoints REST.

Dominios principales del backend:

* Auth
* Users
* Academic
* Evaluation

---

# Tecnologías Utilizadas

## Frontend

* React
* TypeScript
* HTML5
* CSS3
* JavaScript ES6+

---

## Backend Integrado

* Flask
* SQLite
* Waitress
* REST API

---

# Seguridad y Validaciones

El sistema implementa validaciones funcionales y controles de acceso:

* Autenticación por token.
* Restricción de acceso por roles.
* Validación de campos obligatorios.
* Prevención de duplicados.
* Protección de operaciones críticas.
* Validación de relaciones académicas.

---

# Instalación del Proyecto

## Clonar repositorio

```bash
git clone <repository-url>
```

---

## Instalar dependencias

```bash
npm install
```

---

## Ejecutar entorno de desarrollo

```bash
npm run dev
```

---

# Configuración del Backend

## Crear entorno virtual

### Windows

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### Linux / macOS

```bash
python -m venv .venv
source .venv/bin/activate
```

---

## Instalar dependencias backend

```bash
pip install -r requirements.txt
```

---

## Ejecutar servidor backend

```bash
python run.py
```

---

# Autenticación

El sistema utiliza autenticación mediante Bearer Token.

Formato requerido:

```http
Authorization: Bearer <token>
```

---

# Colección Postman

El proyecto incluye una colección Postman para pruebas de endpoints REST.

Ruta:

```bash
academic_service/postman/
```

La colección contiene:

* Endpoints de autenticación.
* Gestión de usuarios.
* Gestión académica.
* Gestión de evaluaciones.
* Operaciones CRUD.

---

# Usuario Seed

```txt
email: admin@example.com
password: Admin123*
```

---

# Modelo Académico del Sistema

Entidades principales:

* User
* Docente
* Estudiante
* Carrera
* Semestre
* Asignatura
* Grupo
* Rubrica
* Criterio
* Escala
* Evaluacion
* Nota
* CalificacionDetalle
* Inscripcion
* Matricula

---

# Reglas de Negocio Relevantes

* Solo puede existir un semestre activo por carrera.
* Los pesos de criterios deben sumar 100%.
* Las rúbricas publicadas no pueden eliminarse.
* No se permiten inscripciones duplicadas.
* Las asignaturas archivadas no pueden reutilizarse.
* Las notas finales quedan bloqueadas tras registro oficial.

---

# Estado del Proyecto

Proyecto académico desarrollado para la asignatura de Frontend, enfocado en el diseño e implementación de interfaces para gestión académica y evaluación mediante rúbricas.
