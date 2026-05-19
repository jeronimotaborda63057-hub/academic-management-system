import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MultiStepForm, { type MultiStepFormValues } from "../../components/multi-step-form/MultiStepForm";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";
import type { TeacherProfile } from "../../models/TeacherProfile";

// ✅ Sin contraseña en edición
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
    },
    {
        label: "Rol",
        name: "role",
        type: "select" as const,
        required: true,
        options: [
            { label: "Estudiante", value: "STUDENT" },
            { label: "Docente", value: "TEACHER" },
            { label: "Admin", value: "ADMIN" },
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

    // ✅ Carga el usuario y mapea sus valores al formulario
    useEffect(() => {
        if (!id) return;
        userService.getById(id).then((user) => {
            if (!user) return;
            const teacherProfile = getTeacherProfile(user.profile);
            setInitialValues({
                email: user.email,
                code: user.code,
                role: user.role,
                first_name: user.profile?.first_name ?? "",
                last_name: user.profile?.last_name ?? "",
                identification: user.profile?.identification ?? "",
                phone: teacherProfile.phone ?? "",
                specialty: teacherProfile.specialty ?? "",
            });
        });
    }, [id]);

    const handleSubmit = async (values: MultiStepFormValues) => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await userService.update(id, {
                email: values.email,
                code: values.code,
            });
            if (!result) throw new Error();
            Swal.fire({
                title: "Éxito",
                text: "Usuario actualizado correctamente.",
                icon: "success",
                confirmButtonText: "Aceptar",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "swal-confirm-btn",
                },
            });
            navigate("/users/list");
        } catch (error) {
            if (error instanceof Error && error.message === "EMAIL_DUPLICADO") {
                Swal.fire({
                    title: "Error",
                    text: "El correo institucional ya está registrado.",
                    icon: "error",
                    confirmButtonText: "Aceptar",
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: "swal-error-btn",
                    },
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Ocurrió un error al actualizar el usuario.",
                    icon: "error",
                    confirmButtonText: "Aceptar",
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: "swal-error-btn",
                    },
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Espera a que carguen los datos antes de renderizar el formulario
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
            onSubmit={handleSubmit}
            isLoading={isLoading}
        />
    );
};

export default Edit;
