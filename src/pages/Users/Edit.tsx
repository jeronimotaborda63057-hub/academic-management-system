import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MultiStepForm, { type MultiStepFormValues } from "../../components/multi-step-form/MultiStepForm";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";
import type { TeacherProfile } from "../../models/TeacherProfile";
import type { User, UserRole } from "../../models/User";

const getPrefix = (role: string) => role === "TEACHER" ? "TCH-" : "STD-";

const STEP1_FIELDS_EDIT = [
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
        label: "Rol",
        name: "role",
        type: "select" as const,
        required: true,
        options: [
            { label: "Estudiante", value: "STUDENT" },
            { label: "Docente", value: "TEACHER" },
        ],
    },
];

const Edit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<MultiStepFormValues | undefined>(undefined);

    const getTeacherProfile = (profile: unknown): Partial<TeacherProfile> => {
        if (!profile || typeof profile !== "object") return {};
        return profile as Partial<TeacherProfile>;
    };

    useEffect(() => {
        if (!id) return;
        userService.getById(id).then((user) => {
            if (!user) return;
            const teacherProfile = getTeacherProfile(user.profile);

            // El código viene como "STD-123" o "TCH-456"; el input solo muestra la parte numérica
            const rawCode = user.code?.replace(/^(STD-|TCH-)/, "") ?? "";

            setInitialValues({
                email: user.email,
                code: rawCode,
                role: user.role,
                first_name: user.profile?.first_name ?? "",
                last_name: user.profile?.last_name ?? "",
                identification: user.profile?.identification ?? "",
                phone: teacherProfile.phone ?? "",
                specialty: teacherProfile.specialty ?? "",
            });
        });
    }, [id]);

    const handleBeforeNext = async (
        values: MultiStepFormValues
    ): Promise<Record<string, string>> => {
        const errors: Record<string, string> = {};
        const prefix = getPrefix(values.role);

        const [emailTaken, codeTaken] = await Promise.all([
            userService.emailExists(String(values.email), id),
            userService.codeExists(`${prefix}${values.code}`, id),
        ]);

        if (emailTaken) errors.email = "Este correo ya está registrado.";
        if (codeTaken) errors.code = "Este código ya está en uso.";

        return errors;
    };

    const handleSubmit = async (values: MultiStepFormValues) => {
        if (!id) return;
        setIsLoading(true);
        try {
            const prefix = getPrefix(values.role);

            const result = await userService.update(id, {
                email: values.email,
                code: `${prefix}${values.code}`,
                role: values.role as UserRole,
                first_name: values.first_name || undefined,
                last_name: values.last_name || undefined,
                phone: values.phone || undefined,
                specialty: values.specialty || undefined,
            } as Partial<User>);

            if (!result) throw new Error();
            Swal.fire("Éxito", "Usuario actualizado correctamente.", "success");
            navigate("/users/list");
        } catch {
            Swal.fire("Error", "Ocurrió un error al actualizar el usuario.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!initialValues) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-sm text-gray-500 dark:text-bodydark2">Cargando usuario...</p>
            </div>
        );
    }

    return (
        <MultiStepForm
            title="Editar usuario"
            subtitle="Modifica los datos del usuario."
            breadcrumb={["Inicio", "Usuarios", "Editar"]}
            step1Fields={STEP1_FIELDS_EDIT}
            initialValues={initialValues}
            onBeforeNext={handleBeforeNext}
            onSubmit={handleSubmit}
            isLoading={isLoading}
        />
    );
};

export default Edit;