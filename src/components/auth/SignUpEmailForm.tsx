import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import type { EmailSignUpData } from "../../models/interfaces/EmailSignUpData";

interface SignUpEmailFormProps {
    loading: boolean;
    onSubmit: (data: EmailSignUpData) => Promise<void>;
}

interface SignUpFormValues extends EmailSignUpData {
    confirmPassword: string;
}

const initialValues: SignUpFormValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const validationSchema = Yup.object({
    fullName: Yup.string()
        .trim()
        .min(3, "Ingresa tu nombre completo.")
        .required("El nombre es obligatorio."),
    email: Yup.string()
        .trim()
        .email("Ingresa un correo valido.")
        .required("El correo es obligatorio."),
    password: Yup.string()
        .min(8, "La contrasena debe tener al menos 8 caracteres.")
        .matches(/[A-Z]/, "Incluye al menos una mayuscula.")
        .matches(/[a-z]/, "Incluye al menos una minuscula.")
        .matches(/[0-9]/, "Incluye al menos un numero.")
        .required("La contrasena es obligatoria."),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Las contrasenas no coinciden.")
        .required("Confirma tu contrasena."),
});

const fieldClassName =
    "h-11 rounded-xl border border-stroke bg-white px-4 text-sm text-black outline-none transition-colors focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white";

const SignUpEmailForm = ({ loading, onSubmit }: SignUpEmailFormProps) => (
    <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async ({ fullName, email, password }) => {
            await onSubmit({
                fullName: fullName.trim(),
                email: email.trim(),
                password,
            });
        }}
    >
        <Form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-bodydark2">
                    Nombre completo
                </label>
                <Field
                    name="fullName"
                    type="text"
                    placeholder="Nombre Apellido"
                    className={fieldClassName}
                />
                <ErrorMessage
                    name="fullName"
                    component="p"
                    className="text-xs text-red-500"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-bodydark2">
                    Correo institucional
                </label>
                <Field
                    name="email"
                    type="email"
                    placeholder="correo@universidad.edu"
                    className={fieldClassName}
                />
                <ErrorMessage
                    name="email"
                    component="p"
                    className="text-xs text-red-500"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-bodydark2">
                    Contrasena
                </label>
                <Field
                    name="password"
                    type="password"
                    placeholder="********"
                    className={fieldClassName}
                />
                <ErrorMessage
                    name="password"
                    component="p"
                    className="text-xs text-red-500"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-bodydark2">
                    Confirmar contrasena
                </label>
                <Field
                    name="confirmPassword"
                    type="password"
                    placeholder="********"
                    className={fieldClassName}
                />
                <ErrorMessage
                    name="confirmPassword"
                    component="p"
                    className="text-xs text-red-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mt-1 h-11 rounded-xl bg-black text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-primary"
            >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
        </Form>
    </Formik>
);

export default SignUpEmailForm;
