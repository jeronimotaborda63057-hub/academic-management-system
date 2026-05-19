import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import type { CreateUserPayload } from "../../models/uml/User";
import Swal from "sweetalert2";
import MultiStepForm, { type MultiStepFormValues } from "../../components/multi-step-form/MultiStepForm";

const getPrefix = (role: string) => role === "TEACHER" ? "TCH-" : "STD-";

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
        prefix: (values: Record<string, string>) => getPrefix(values.role),
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
        ],
    },
];

const Create: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleBeforeNext = async (
        values: MultiStepFormValues
    ): Promise<Record<string, string>> => {
        const errors: Record<string, string> = {};
        const prefix = getPrefix(values.role);

        const [emailTaken, codeTaken] = await Promise.all([
            userService.emailExists(String(values.email)),
            userService.codeExists(`${prefix}${values.code}`),
        ]);

        if (emailTaken) errors.email = "Este correo ya está registrado.";
        if (codeTaken)  errors.code  = "Este código ya está en uso.";

        return errors;
    };

    const buildPayload = (values: MultiStepFormValues): CreateUserPayload => {
        const prefix = getPrefix(values.role);
        const code   = `${prefix}${values.code}`;
        const base   = { email: values.email, password: values.password, code };

        if (values.role === "ADMIN") return { ...base, role: "ADMIN" };
        if (values.role === "TEACHER") return {
            ...base, role: "TEACHER",
            first_name:     values.first_name,
            last_name:      values.last_name,
            identification: values.identification,
            phone:          values.phone     || undefined,
            specialty:      values.specialty || undefined,
        };
        return {
            ...base, role: "STUDENT",
            first_name:     values.first_name,
            last_name:      values.last_name,
            identification: values.identification,
        };
    };

    const handleSubmit = async (values: MultiStepFormValues) => {
        setIsLoading(true);
        try {
            const result = await userService.createUser(buildPayload(values));
            if (!result) throw new Error();
            Swal.fire("Éxito", "Usuario creado correctamente.", "success");
            navigate("/users/list");
        } catch {
            Swal.fire("Error", "Ocurrió un error al crear el usuario.", "error");
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
            onBeforeNext={handleBeforeNext}
            onSubmit={handleSubmit}
            isLoading={isLoading}
        />
    );
};

export default Create;