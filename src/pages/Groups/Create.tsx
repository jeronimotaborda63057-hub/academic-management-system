import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import type { Group } from "../../models/Group";
import { groupService } from "../../services/groupService";

import GroupForm, { type GroupFormValues } from "../../components/forms/GroupForm";

const Create = () => {
    const navigate = useNavigate();

    const onSubmit = async (payload: GroupFormValues) => {
        // DTO hacia API: ya usa los nombres esperados por backend
        const response = await groupService.create(payload as any);
        if (!response) throw new Error("No se pudo crear el grupo");
        navigate("/groups/assign-teacher");
    };

    const initial = useMemo(() => null as Partial<Group> | null, []);

    return (
        <GroupForm
            mode="create"
            initial={initial}
            onSubmit={onSubmit}
            onCancel={() => navigate("/groups/assign-teacher")}
        />
    );
};

export default Create;

