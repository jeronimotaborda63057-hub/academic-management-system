import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Group } from "../../models/Group";
import { groupService } from "../../services/groupService";
import type { GroupFormValues } from "../../components/forms/GroupForm";
import GroupForm from "../../components/forms/GroupForm";


const Edit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [initial, setInitial] = useState<Partial<Group> | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (!id) return;
            const group = await groupService.getById(id);
            if (!mounted) return;
            setInitial(group ?? null);
        };

        load();

        return () => {
            mounted = false;
        };
    }, [id]);

    const onSubmit = async (payload: GroupFormValues) => {
        if (!id) throw new Error("ID inválido");
        const response = await groupService.update(id, payload as any);
        if (!response) throw new Error("No se pudo actualizar el grupo");
        navigate("/groups/assign-teacher");
    };

    const memoInitial = useMemo(() => initial, [initial]);

    return (
        <GroupForm
            mode="edit"
            initial={memoInitial}
            onSubmit={onSubmit}
            onCancel={() => navigate("/groups/assign-teacher")}
        />
    );
};

export default Edit;

