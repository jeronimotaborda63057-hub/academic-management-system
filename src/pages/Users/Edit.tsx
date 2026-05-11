import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MultiStepForm from "../../components/multiStepForm/MultiStepForm";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";

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
            { label: "Docente",    value: "TEACHER" },
            { label: "Admin",      value: "ADMIN"   },
        ],
    },
];

const Edit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<Record<string, any> | undefined>(undefined);

    // ✅ Carga el usuario y mapea sus valores al formulario
    useEffect(() => {
        if (!id) return;
        userService.getById(id).then((user) => {
            if (!user) return;
            setInitialValues({
                email:          user.email,
                code:           user.code,
                role:           user.role,
                first_name:     user.profile?.first_name     ?? "",
                last_name:      user.profile?.last_name      ?? "",
                identification: user.profile?.identification ?? "",
                phone:          (user.profile as any)?.phone      ?? "",
                specialty:      (user.profile as any)?.specialty   ?? "",
            });
        });
    }, [id]);

    const handleSubmit = async (values: Record<string, any>) => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await userService.update(id, {
                email: values.email,
                code:  values.code,
            });
            if (!result) throw new Error();
            Swal.fire("Éxito", "Usuario actualizado correctamente.", "success");
            navigate("/users/list");
        } catch (error: any) {
            if (error.message === "EMAIL_DUPLICADO") {
                Swal.fire("Error", "El correo institucional ya está registrado.", "error");
            } else {
                Swal.fire("Error", "Ocurrió un error al actualizar el usuario.", "error");
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