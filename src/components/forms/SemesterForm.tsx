import type { FormikProps } from "formik";
import type { SemesterForm as SemesterType} from "../../models/SemesterForm";

interface Props {
    formik: FormikProps<SemesterType>;
}

const SemesterFormComponent = ({ formik }: Props) => {
    const {
        values,
        handleChange,
        handleSubmit,
        errors,
        touched,
        isSubmitting,
    } = formik;

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-lg max-w-xl mx-auto space-y-6"
        >
            <h2 className="text-2xl font-bold text-center">
                Semestre
            </h2>

            {/* Nombre */}
            <div>
                <label className="label">Nombre</label>
                <input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    className="input"
                />
                {touched.name && errors.name && (
                    <p className="error">{errors.name}</p>
                )}
            </div>

            {/* Código */}
            <div>
                <label className="label">Código</label>
                <input
                    name="code"
                    value={values.code}
                    onChange={handleChange}
                    className="input"
                />
                {touched.code && errors.code && (
                    <p className="error">{errors.code}</p>
                )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Inicio</label>
                    <input
                        type="date"
                        name="start_date"
                        value={values.start_date}
                        onChange={handleChange}
                        className="input"
                    />
                </div>

                <div>
                    <label className="label">Fin</label>
                    <input
                        type="date"
                        name="end_date"
                        value={values.end_date}
                        onChange={handleChange}
                        className="input"
                    />
                </div>
            </div>

            {/* Activo */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    name="is_active"
                    checked={values.is_active}
                    onChange={handleChange}
                />
                <span>Activo</span>
            </div>

            {errors.is_active && (
                <p className="error">{errors.is_active}</p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
                Guardar
            </button>
        </form>
    );
};

export default SemesterFormComponent;