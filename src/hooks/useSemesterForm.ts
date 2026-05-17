import { useFormik } from "formik";
import * as Yup from "yup";
import type{ SemesterForm as SemesterType} from "../models/SemesterForm";
import type { Semester } from "../models/Semester";

interface Props {
    initialValues?: SemesterType;
    onSubmit: (values: SemesterType) => Promise<void>;
    existingSemesters: Semester[];
}

export const useSemesterForm = ({
    initialValues,
    onSubmit,
    existingSemesters,
}: Props) => {
    return useFormik<SemesterType>({
        enableReinitialize: true, // 🔥 CLAVE para EDIT

        initialValues: initialValues || {
            name: "",
            code: "",
            start_date: "",
            end_date: "",
            is_active: false,
        },

        validationSchema: Yup.object({
            name: Yup.string().required("El nombre es obligatorio"),

            code: Yup.string()
                .required("El código es obligatorio")
                .min(3),

            start_date: Yup.date().required("Fecha de inicio obligatoria"),

            end_date: Yup.date()
                .required("Fecha de fin obligatoria")
                .min(Yup.ref("start_date"), "Debe ser posterior al inicio"),

            is_active: Yup.boolean().test(
                "only-one-active",
                "Solo puede haber un semestre activo",
                function (value) {
                    if (!value) return true;

                    const { id } = this.parent;

                    const existsActive = existingSemesters.some(
                        (s) => s.is_active && s.id !== id
                    );

                    return !existsActive;
                }
            ),
        }),

        onSubmit: async (values, helpers) => {
            await onSubmit(values);
            helpers.setSubmitting(false);
        },
    });
};
