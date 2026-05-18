import { useState } from "react";
import Swal from "sweetalert2";

import {
    findGroupBySubject,
    resolveGroupId,
} from "../../utils/rubric/AssociateRubricUtils";
import type { Rubric }  from "../../models/rubric/AssociateRubricTypes";
import type { UseSubjectSelectionProps } from "../../models/rubric/useSubjectSelectionProps";
import type { UseSubjectSelectionReturn } from "../../models/rubric/useSubjectSelectionReturn";

export const useSubjectSelection = ({
    groups,
    onRubricClear,
}: UseSubjectSelectionProps): UseSubjectSelectionReturn => {
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);

    const resetSelection = () => {
        setSelectedSubjectId("");
        setSelectedGroupId("");
        setSelectedRubric(null);
    };

    // Usado cuando la evaluación ya trae group_id
    const setSubjectAndGroup = (subjectId: string, groupId: string) => {
        setSelectedSubjectId(subjectId);
        setSelectedGroupId(groupId);
        setSelectedRubric(null);
        onRubricClear();
    };

    const handleSubjectChange = (subjectId: string) => {
        setSelectedSubjectId(subjectId);
        setSelectedRubric(null);
        onRubricClear();

        if (!subjectId) {
            setSelectedGroupId("");
            return;
        }

        const match = findGroupBySubject(groups, subjectId);

        if (match) {
            setSelectedGroupId(resolveGroupId(match));
        } else {
            setSelectedGroupId("");
            Swal.fire({
                icon: "warning",
                title: "Sin grupo",
                text: "No existe grupo asociado a la asignatura.",
            });
        }
    };

    return {
        selectedSubjectId,
        selectedGroupId,
        selectedRubric,
        setSelectedRubric,
        handleSubjectChange,
        setSubjectAndGroup,
        resetSelection,
    };
};