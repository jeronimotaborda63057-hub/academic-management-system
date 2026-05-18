import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import PageHeader from "../../components/ui/PageHeader";

import { groupService } from "../../services/groupService";
import { teacherService } from "../../services/teacherService";
import { semesterService } from "../../services/semesterService";
import { subjectService } from "../../services/subjectService";

import type { Group } from "../../models/uml/Group";
import type { Teacher } from "../../models/uml/Teacher";
import type { Semester } from "../../models/uml/Semester";
import type { Subject } from "../../models/uml/Subject";

import AssignTeacherStepper from "../../components/groups/AssignTeacherStepper";
import GroupSelectionTable from "../../components/groups/GroupSelectionTable";
import TeacherSelectionPanel from "../../components/groups/TeacherSelectionPanel";
import GroupDetailsCard from "../../components/groups/GroupDetailCard";
import AssignmentConfirmation from "../../components/groups/AssignmentConfirmation";

const AssignTeacherPage = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedSemester, setSelectedSemester] =
    useState<Semester | null>(null);

  const [selectedGroup, setSelectedGroup] =
    useState<Group | null>(null);

  const [selectedTeacher, setSelectedTeacher] =
    useState<Teacher | null>(null);

  const activeSemesters = semesters;

  const filteredGroups = useMemo(() => {
    if (!selectedSemester) return [];

    return groups.filter(
      (group: Group) =>
        group.semester_id === selectedSemester.id
    );
  }, [groups, selectedSemester]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (resetWizard = false) => {

    try {
      setLoading(true);

      const [
        semesterResponse,
        groupResponse,
        teacherResponse,
        subjectResponse,
      ] = await Promise.all([
        semesterService.getAll(),
        groupService.getAll(),
        teacherService.getAll(),
        subjectService.getAll(),
      ]);

      setSemesters(semesterResponse || []);
      setGroups(groupResponse || []);
      setTeachers(teacherResponse || []);
      setSubjects(subjectResponse || []);

      if (resetWizard) {
        setCurrentStep(1)

        setSelectedSemester(null)
        setSelectedGroup(null)
        setSelectedTeacher(null)
      }
    } catch (error) {
      toast.error("Error cargando la información");
    } finally {
      setLoading(false);
    }
  };

  const validateAssignment = () => {
    if (!selectedGroup || !selectedTeacher) {
      toast.error("Debes seleccionar un grupo y un docente");
      return false;
    }

    if (!selectedGroup.subject_id) {
      toast.error(
        "El grupo seleccionado no tiene asignatura definida"
      );
      return false;
    }

    if (selectedGroup.teacher_id === selectedTeacher.id) {
      toast.error(
        "El docente seleccionado ya está asignado a este grupo"
      );
      return false;
    }

    const duplicatedAssignment = groups.find(
      (group: Group) =>
        group.id !== selectedGroup.id &&
        group.teacher_id === selectedTeacher.id &&
        group.subject_id === selectedGroup.subject_id &&
        group.semester_id === selectedGroup.semester_id
    );

    if (duplicatedAssignment) {
      toast.error(
        "El docente ya tiene otro grupo con esta asignatura en el semestre activo"
      );
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedSemester) {
      toast.error("Selecciona un semestre");
      return;
    }

    if (currentStep === 2 && !selectedGroup) {
      toast.error("Selecciona un grupo");
      return;
    }

    if (currentStep === 3) {
      if (!selectedTeacher) {
        toast.error("Selecciona un docente");
        return;
      }

      const isValid = validateAssignment();

      if (!isValid) {
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleConfirmAssignment = async () => {
    if (!validateAssignment()) return;

    try {
      setLoading(true);

      await groupService.assignTeacherToGroup(
        selectedGroup!.id!,
        selectedTeacher!.id!
      );

      toast.success("Docente asignado correctamente");

      await loadInitialData(true);

    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error asignando docente";

      toast.error(
        message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Asignar docente a grupo"
        subtitle="Vincula un docente a un grupo del semestre activo."
      />

      <AssignTeacherStepper currentStep={currentStep} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 flex flex-col gap-6">
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">
                Seleccionar semestre
              </h2>

              <select
                value={selectedSemester?.id || ""}
                onChange={(e) => {
                  const semester = activeSemesters.find(
                    (semester: Semester) =>
                      semester.id === e.target.value
                  );

                  setSelectedSemester(semester || null);
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="">
                  Selecciona un semestre
                </option>

                {activeSemesters.map((semester) => (
                  <option
                    key={semester.id}
                    value={semester.id}
                  >
                    {semester.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleNextStep}
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <GroupSelectionTable
              groups={filteredGroups}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          )}

          {currentStep === 3 && (
            <TeacherSelectionPanel
              teachers={teachers}
              selectedTeacher={selectedTeacher}
              onSelectTeacher={setSelectedTeacher}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          )}

          {currentStep === 4 && (
            <AssignmentConfirmation
              semester={selectedSemester}
              group={selectedGroup}
              teacher={selectedTeacher}
              subjects={subjects}
              loading={loading}
              onBack={handlePreviousStep}
              onConfirm={handleConfirmAssignment}
            />
          )}
        </div>

        <div className="xl:col-span-1">
          <GroupDetailsCard
            group={selectedGroup}
            semester={selectedSemester}
            teachers={teachers}
            subjects={subjects}
          />
        </div>
      </div>
    </div>
  );
};

export default AssignTeacherPage;
