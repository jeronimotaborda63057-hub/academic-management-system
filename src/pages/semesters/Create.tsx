import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { semesterService } from "../../services/semesterService";
import { careerService } from "../../services/careerService";
import type { SemesterForm } from "../../models/Semester";
import type { Career } from "../../models/Career";
import PageHeader from "../../components/PageHeader";
import { Info } from "lucide-react";
import Swal from "sweetalert2";

const Create: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [careers, setCareers] = useState<Career[]>([]);
    const [values, setValues] = useState<SemesterForm>({
        career_id: "", code: "", name: "",
        start_date: "", end_date: "", is_active: false,
    });

    useEffect(() => {
        careerService.getAll().then((data) => setCareers(data ?? []));
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await semesterService.create(values);
            if (!result) throw new Error();
            Swal.fire("Éxito", "Semestre creado correctamente.", "success");
            navigate("/semesters/list");
        } catch {
            Swal.fire("Error", "Ocurrió un error al crear el semestre.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const baseInput = "h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors w-full";
    const labelClass = "text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider";

    return (
        <div>
            <PageHeader
                title="Nuevo semestre"
                subtitle="Completa los datos para registrar un nuevo semestre."
                breadcrumb={["Inicio", "Semestres", "Crear"]}
            />

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-4"
            >
                {/* Carrera */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>
                        Carrera <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="career_id"
                        value={values.career_id}
                        onChange={handleChange}
                        required
                        className={baseInput}
                    >
                        <option value="">Selecciona una carrera</option>
                        {careers.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Código y Nombre */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>
                            Código <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={values.code}
                            onChange={handleChange}
                            placeholder="Ej. 2024-1"
                            required
                            className={baseInput}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            placeholder="Ej. 2024 - 1"
                            required
                            className={baseInput}
                        />
                    </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>
                            Fecha inicio <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={values.start_date}
                            onChange={handleChange}
                            required
                            className={baseInput}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>
                            Fecha fin <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            value={values.end_date}
                            onChange={handleChange}
                            required
                            className={baseInput}
                        />
                    </div>
                </div>

                {/* Aviso HU-02 criterio 4 */}
                <div className="flex items-start gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 px-4 py-3">
                    <Info size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-green-700 dark:text-green-400">
                        Al activar este semestre, el sistema desactivará automáticamente el semestre activo actual de esta carrera.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/semesters")}
                        className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                        {isLoading ? "Guardando..." : "Guardar semestre"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Create;