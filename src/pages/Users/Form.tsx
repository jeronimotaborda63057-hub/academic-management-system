import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "../../services/userService";
import type { CreateUserPayload, UserRole } from "../../models/User";
import PageHeader from "../../components/PageHeader";
import Swal from "sweetalert2";

const ROLES: { label: string; value: UserRole }[] = [
    { label: "Docente", value: "TEACHER" },
    { label: "Estudiante", value: "STUDENT" },
    { label: "Administrador", value: "ADMIN" },
];

const Form: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [role, setRole] = useState<UserRole>("STUDENT");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
        code: "",
        first_name: "",
        last_name: "",
        identification: "",
        phone: "",
        specialty: "",
    });

    // Si es edición, carga el usuario
    useEffect(() => {
        if (!id) return;
        userService.getById(id).then((user) => {
            if (!user) return;
            setRole(user.role);
            setForm({
                email: user.email,
                password: "",
                code: user.code,
                first_name: user.profile?.first_name ?? "",
                last_name: user.profile?.last_name ?? "",
                identification: user.profile?.identification ?? "",
                phone: (user.profile as any)?.phone ?? "",
                specialty: (user.profile as any)?.specialty ?? "",
            });
        });
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // HU-01 criterio 2: validación de email institucional
    const validateEmail = (email: string): boolean => {
        const institutionalRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return institutionalRegex.test(email);
    };

    const buildPayload = (): CreateUserPayload => {
        const base = { email: form.email, password: form.password, code: form.code };
        if (role === "ADMIN") return { ...base, role: "ADMIN" };
        if (role === "TEACHER") return {
            ...base, role: "TEACHER",
            first_name: form.first_name,
            last_name: form.last_name,
            identification: form.identification,
            phone: form.phone || undefined,
            specialty: form.specialty || undefined,
        };
        return {
            ...base, role: "STUDENT",
            first_name: form.first_name,
            last_name: form.last_name,
            identification: form.identification,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(form.email)) {
        Swal.fire("Error", "El correo institucional no es válido.", "error");
        return;
    }

    setLoading(true);
    try {
        if (isEdit && id) {
            const result = await userService.update(id, { email: form.email, code: form.code });
            if (!result) throw new Error();
        } else {
            const result = await userService.createUser(buildPayload());
            if (!result) throw new Error();
        }
        Swal.fire("Éxito", `Usuario ${isEdit ? "actualizado" : "creado"} correctamente.`, "success");
        navigate("/users/list");
    } catch (error: any) {
        // ✅ HU-01 criterio 2: mensaje específico para email duplicado
        if (error.message === "EMAIL_DUPLICADO") {
            Swal.fire("Error", "El correo institucional ya está registrado.", "error");
        } else {
            Swal.fire("Error", "Ocurrió un error al guardar el usuario.", "error");
        }
    } finally {
        setLoading(false);
    }
};

    const showProfileFields = role === "TEACHER" || role === "STUDENT";

    return (
        <div>
            <PageHeader
                title={isEdit ? "Editar usuario" : "Nuevo usuario"}
                subtitle={isEdit ? "Modifica los datos del usuario." : "Completa el formulario para crear un usuario."}
                breadcrumb={["Inicio", "Usuarios", isEdit ? "Editar" : "Crear"]}
            />

            <form onSubmit={handleSubmit} className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-6">

                {/* ROL */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</label>
                    <select
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        disabled={isEdit}
                        className="h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors disabled:opacity-50"
                    >
                        {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                </div>

                {/* DATOS BASE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Correo institucional" name="email" type="email" value={form.email} onChange={handleChange} required />
                    <Field label="Código" name="code" value={form.code} onChange={handleChange} required />
                    {!isEdit && (
                        <Field label="Contraseña" name="password" type="password" value={form.password} onChange={handleChange} required />
                    )}
                </div>

                {/* DATOS DE PERFIL — docente o estudiante */}
                {showProfileFields && (
                    <>
                        <hr className="border-stroke dark:border-strokedark" />
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Datos del perfil</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Nombre" name="first_name" value={form.first_name} onChange={handleChange} required />
                            <Field label="Apellido" name="last_name" value={form.last_name} onChange={handleChange} required />
                            <Field label="Identificación" name="identification" value={form.identification} onChange={handleChange} required />
                            {role === "TEACHER" && (
                                <>
                                    <Field label="Teléfono" name="phone" value={form.phone} onChange={handleChange} />
                                    <Field label="Especialidad" name="specialty" value={form.specialty} onChange={handleChange} />
                                </>
                            )}
                        </div>
                    </>
                )}

                {/* ACCIONES */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/users/list")}
                        className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
                    </button>
                </div>

            </form>
        </div>
    );
};

// Subcomponente para no repetir inputs
const Field = ({
    label, name, value, onChange, type = "text", required = false
}: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string; required?: boolean;
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors"
        />
    </div>
);

export default Form;