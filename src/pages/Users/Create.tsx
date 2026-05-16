import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import type { CreateUserPayload } from "../../models/User";
import Swal from "sweetalert2";
import MultiStepForm from "../../components/multi-step-form/MultiStepForm";

const STEP1_FIELDS_CREATE = [
    {
        label: "Correo institucional",
        name: "email",
        type: "email" as const,
        required: true,
    },
    {
        label: "Código",
        name: "code",
        type: "text" as const,
        required: true,
    },
    {
        label: "Contraseña",
        name: "password",
        type: "password" as const,
        required: true,
    },
    {
        label: "Rol",
        name: "role",
        type: "select" as const,
        required: true,
        options: [
            { label: "Estudiante", value: "STUDENT" },
            { label: "Docente",    value: "TEACHER" },
            { label: "Admin",      value: "ADMIN"   },
        ],
    },
];

const Create: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const buildPayload = (values: Record<string, any>): CreateUserPayload => {
        const base = { email: values.email, password: values.password, code: values.code };
        if (values.role === "ADMIN") return { ...base, role: "ADMIN" };
        if (values.role === "TEACHER") return {
            ...base, role: "TEACHER",
            first_name: values.first_name,
            last_name: values.last_name,
            identification: values.identification,
            phone: values.phone || undefined,
            specialty: values.specialty || undefined,
        };
        return {
            ...base, role: "STUDENT",
            first_name: values.first_name,
            last_name: values.last_name,
            identification: values.identification,
        };
    };

    const handleSubmit = async (values: Record<string, any>) => {
        setIsLoading(true);
        try {
            const result = await userService.createUser(buildPayload(values));
            if (!result) throw new Error();
            Swal.fire("Éxito", "Usuario creado correctamente.", "success");
            navigate("/users/list");
        } catch (error: any) {
            if (error.message === "EMAIL_DUPLICADO") {
                Swal.fire("Error", "El correo institucional ya está registrado.", "error");
            } else {
                Swal.fire("Error", "Ocurrió un error al crear el usuario.", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MultiStepForm
            title="Crear usuario"
            subtitle="Completa los datos para registrar un nuevo usuario."
            breadcrumb={["Inicio", "Usuarios", "Crear"]}
            step1Fields={STEP1_FIELDS_CREATE}
            onSubmit={handleSubmit}
            isLoading={isLoading}
        />
    );
};

export default Create;