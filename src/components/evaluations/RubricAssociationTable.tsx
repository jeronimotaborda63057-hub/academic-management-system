import type { Rubric } from "../../models/Rubric";

interface Props {
    rubrics: Rubric[];

    selectedRubric: Rubric | null;

    onSelect: (rubric: Rubric) => void;
}

export default function RubricAssociationTable({
    rubrics,
    selectedRubric,
    onSelect,
}: Props) {

    return (
        <div className="
            overflow-hidden rounded-2xl
            border border-gray-200 bg-white
        ">
            <table className="w-full text-sm">

                <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="px-4 py-3 text-left">
                            Seleccionar
                        </th>

                        <th className="px-4 py-3 text-left">
                            Rúbrica
                        </th>

                        <th className="px-4 py-3 text-left">
                            Estado
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {rubrics.map((rubric) => {

                        const active =
                            selectedRubric?.id === rubric.id;

                        return (
                            <tr
                                key={rubric.id}
                                className={`
                                    border-t transition
                                    ${
                                        active
                                            ? "bg-primary/5"
                                            : "hover:bg-gray-50"
                                    }
                                `}
                            >
                                <td className="px-4 py-4">
                                    <input
                                        type="radio"
                                        checked={active}
                                        onChange={() => onSelect(rubric)}
                                    />
                                </td>

                                <td className="px-4 py-4">
                                    <div>
                                        <p className="
                                            font-medium text-gray-900
                                        ">
                                            {rubric.title}
                                        </p>

                                        <p className="
                                            text-xs text-gray-500
                                        ">
                                            {rubric.description}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <span className="
                                        rounded-full
                                        bg-green-100
                                        px-3 py-1 text-xs
                                        font-medium text-green-700
                                    ">
                                        Publicada
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}