import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CareerForm from "../../components/forms/CareerForm";
import { careerService } from "../../services/careerService";
import type { Career } from "../../models/Career";
import type { CareerForm as CareerFormType } from "../../models/CareerForm";

export default function EditCareer() {
    const { id } = useParams();
    const [career, setCareer] = useState<Career | null>(null);

    useEffect(() => {
        const fetchCareer = async () => {
            if (!id) return;
            const data = await careerService.getById(id);
            setCareer(data);
        };

        fetchCareer();
    }, [id]);

    if (!career) return <p>Cargando...</p>;

    const initialValues: CareerFormType = {
        code: career.code,
        name: career.name,
        is_active: career.is_active,
    };

    const handleSubmit = async (data: CareerFormType) => {
        if (!id) return;
        await careerService.update(id, data);
        console.log("Carrera actualizada");
    };

    return (
        <CareerForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isEdit
        />
    );
}