import { useFormik } from "formik";
import * as Yup from "yup";
import type { CareerForm } from "../models/Career";

interface UseCareerFormProps {
    initialValues: CareerForm;
    onSubmit: (data: CareerForm) => Promise<void>;
}

export const useCareerForm = ({
    initialValues,
    onSubmit,
}: UseCareerFormProps) => {

    const validationSchema = Yup.object({
        code: Yup.string()
            .required("El código es obligatorio")
            .min(3, "Mínimo 3 caracteres"),

        name: Yup.string()
            .required("El nombre es obligatorio")
            .min(5, "Mínimo 5 caracteres"),

        description: Yup.string()
            .max(200, "Máximo 200 caracteres"),

        is_active: Yup.boolean(),
    });

    return useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, helpers) => {
            await onSubmit(values);
            helpers.setSubmitting(false);
        },
    });
};