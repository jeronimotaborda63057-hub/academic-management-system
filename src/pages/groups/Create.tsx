import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import GroupForm, { type GroupFormValues } from "../../components/forms/GroupForm";
import type { Semester } from "../../models/uml/Semester";
import type { Subject } from "../../models/uml/Subject";
import type { Teacher } from "../../models/uml/Teacher";
import { groupService } from "../../services/groupService";
import { semesterService } from "../../services/semesterService";
import { subjectService } from "../../services/subjectService";
import { teacherService } from "../../services/teacherService";

const emptyValues: GroupFormValues = {
    name: "",
    group_code: "",
    capacity: 0,
    semester_id: "",
    subject_id: "",
    teacher_id: "",
};

const validate = (values: GroupFormValues): string | null => {
    if (!values.name.trim()) return "El nombre del grupo es obligatorio.";
    if (!values.group_code.trim()) return "El codigo del grupo es obligatorio.";
    if (!values.capacity || values.capacity <= 0) return "La capacidad debe ser mayor a 0.";
    if (!values.semester_id) return "Selecciona un semestre.";
    if (!values.subject_id) return "Selecciona una asignatura.";
    if (!values.teacher_id) return "Selecciona un docente.";
    return null;
};

const Create = () => {
    const navigate = useNavigate();

    const [values, setValues] = useState<GroupFormValues>(emptyValues);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadCatalogs = async () => {
            try {
                const [semestersData, subjectsData, teachersData] = await Promise.all([
                    semesterService.getAllWithAuth(),
                    subjectService.getAllWithAuth(),
                    teacherService.getAllWithAuth(),
                ]);

                setSemesters(semestersData);
                setSubjects(subjectsData);
                setTeachers(teachersData);
            } catch {
                toast.error("Error cargando catalogos.");
            }
        };

        loadCatalogs();
    }, []);

    const handleChange = (field: keyof GroupFormValues, value: string | number) => {
        setValues((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async () => {
        const error = validate(values);
        if (error) {
            toast.error(error);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await groupService.create(values);
            if (!response) throw new Error("No se pudo crear el grupo.");
            toast.success("Grupo creado correctamente.");
            navigate("/groups/assign-teacher");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al guardar el grupo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GroupForm
            mode="create"
            values={values}
            semesters={semesters}
            subjects={subjects}
            teachers={teachers}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/groups/assign-teacher")}
        />
    );
};

export default Create;