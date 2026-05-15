import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Save, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

import PageHeader from '../../components/ui/PageHeader';
import { useFinalGrade } from '../../hooks/useFinalGrade';
import FinalGradeGroupCard from '../../components/grades/FinalGradeGroupCard';
import FinalGradeTable from '../../components/grades/FinalGradeTable';
import FinalGradeSummaryPanel from '../../components/grades/FinalGradeSummaryPanel';
import IncompleteGradesAlert from '../../components/grades/IncompleteGradesAlert';

// ──────────────────────────────────────────────────────────────────────────────
// CU-12: Registrar nota final
// Flujo principal:
//   1. El docente accede al módulo de notas finales de su grupo.
//   2. El sistema muestra por cada Inscripción: la suma ponderada de Nota.nota_final
//      de todas las Evaluaciones.
//   3. El docente revisa el consolidado.
//   4. Confirma el registro oficial.
//   5. El sistema bloquea edición de Nota y genera el reporte.
// ──────────────────────────────────────────────────────────────────────────────

const RegisterFinalGradePage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();

    // Estado local para el modal de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDraftConfirm, setShowDraftConfirm] = useState(false);

    const {
        consolidated,
        loading,
        confirming,
        savingDraft,
        error,
        confirmOfficial,
        saveDraft,
        downloadReport,
    } = useFinalGrade({ groupId: groupId ?? '' });

    // ── Handlers ──────────────────────────────────────────────────────────────

    // Paso 4: Confirmar registro oficial → bloquea edición y genera reporte
    const handleConfirmOfficial = async () => {
        setShowConfirmModal(false);
        const ok = await confirmOfficial();
        if (ok) {
            toast.success('Registro oficial confirmado. Las notas han sido bloqueadas.');
        } else {
            toast.error('No se pudo confirmar el registro. Intente nuevamente.');
        }
    };

    // Guardar borrador sin confirmar oficialmente
    const handleSaveDraft = async () => {
        setShowDraftConfirm(false);
        const ok = await saveDraft();
        if (ok) {
            toast.success('Borrador guardado exitosamente.');
        } else {
            toast.error('No se pudo guardar el borrador. Intente nuevamente.');
        }
    };

    // Descarga el reporte — habilitado sólo cuando is_confirmed = true
    const handleDownloadReport = async () => {
        await downloadReport();
    };

    // ── Estados de carga y error ───────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 size={36} className="animate-spin text-primary" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cargando consolidado de notas…
                </p>
            </div>
        );
    }

    if (error || !consolidated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-sm text-danger font-medium">
                    {error ?? 'No se pudo cargar el consolidado.'}
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 border border-stroke rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Volver
                </button>
            </div>
        );
    }

    // Excepción E2: Semestre inactivo → mostrar bloqueo
    if (!consolidated.semester_is_active) {
        return (
            <div className="mx-auto max-w-screen-xl px-4 py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Volver a grupos
                </button>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
                    <Lock size={32} className="text-danger" />
                    <p className="font-semibold text-danger text-lg">Semestre inactivo</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                        El semestre referenciado por este grupo está inactivo.
                        No se puede registrar la nota final. Contacte al administrador.
                    </p>
                </div>
            </div>
        );
    }

    const incompleteCount = consolidated.summary.students_with_partial_grade;

    return (
        <div className="mx-auto max-w-screen-xl px-4 py-6">

            {/* ── Header con PageHeader del proyecto ──────────────────────── */}
            <PageHeader
                title="Registrar nota final"
                subtitle={`Grupo ${consolidated.group.group_code ?? ''}`}
                breadcrumb={['Inicio', 'Grupos', 'Nota final']}
                action={
                    consolidated.is_confirmed ? (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
                            <Lock size={11} />
                            Confirmado y bloqueado
                        </span>
                    ) : undefined
                }
            />

            {/* ── Paso 1-2: Tarjeta del grupo (info general) ─────────────── */}
            <FinalGradeGroupCard
                group={consolidated.group}
                totalStudents={consolidated.summary.total_students}
                activeEnrollments={consolidated.rows.length}
                evaluationsCount={consolidated.evaluations.length}
                totalWeight={consolidated.total_weight}
            />

            {/* ── Layout principal: tabla + panel lateral ─────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

                {/* ── Paso 2-3: Tabla del consolidado ──────────────────────── */}
                <div className="flex flex-col gap-4">
                    <FinalGradeTable
                        evaluations={consolidated.evaluations}
                        rows={consolidated.rows}
                        totalWeight={consolidated.total_weight}
                    />

                    {/* ── Excepciones E1 / E2 ──────────────────────────────── */}
                    <IncompleteGradesAlert
                        incompleteCount={incompleteCount}
                        semesterIsActive={consolidated.semester_is_active}
                    />

                    {/* ── Paso 4-5: Footer de acciones ─────────────────────── */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-boxdark rounded-xl shadow p-4 mt-2">

                        {consolidated.is_confirmed ? (
                            // Ya confirmado: mostrar estado bloqueado
                            <div className="flex items-center gap-2 text-success text-sm font-medium">
                                <CheckCircle size={18} />
                                <span>Notas registradas oficialmente y bloqueadas.</span>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                                    {incompleteCount > 0
                                        ? `${incompleteCount} estudiante(s) con nota parcial. Puede confirmar igualmente.`
                                        : 'Todos los estudiantes tienen nota completa.'
                                    }
                                </p>
                                <div className="flex items-center gap-3">
                                    {/* Guardar borrador (flujo alternativo) */}
                                    <button
                                        onClick={() => setShowDraftConfirm(true)}
                                        disabled={savingDraft || confirming}
                                        className="flex items-center gap-2 px-4 py-2 border border-stroke rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-meta-4 disabled:opacity-50 transition-colors"
                                    >
                                        {savingDraft
                                            ? <Loader2 size={15} className="animate-spin" />
                                            : <Save size={15} />
                                        }
                                        Guardar borrador
                                    </button>

                                    {/* Confirmar registro oficial (paso 4) */}
                                    <button
                                        onClick={() => setShowConfirmModal(true)}
                                        disabled={confirming || savingDraft}
                                        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                                    >
                                        {confirming
                                            ? <Loader2 size={15} className="animate-spin" />
                                            : <CheckCircle size={15} />
                                        }
                                        Confirmar registro oficial
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Panel lateral derecho ─────────────────────────────────── */}
                <FinalGradeSummaryPanel
                    summary={consolidated.summary}
                    semesterIsActive={consolidated.semester_is_active}
                    isConfirmed={consolidated.is_confirmed}
                    onPreviewReport={handleDownloadReport}
                />
            </div>

            {/* ── Modal: confirmar registro oficial ───────────────────────── */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <CheckCircle size={20} className="text-primary" />
                            </div>
                            <h3 className="text-base font-semibold text-black dark:text-white">
                                Confirmar registro oficial
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            ¿Está seguro de que desea confirmar el registro oficial de notas finales
                            para el grupo <strong>{consolidated.group.group_code}</strong>?
                        </p>
                        <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc list-inside mb-5 space-y-1">
                            <li>Las notas quedarán bloqueadas (Nota inmutable).</li>
                            <li>Solo el administrador podrá desbloquearlas.</li>
                            <li>Se generará el reporte descargable del grupo.</li>
                            {incompleteCount > 0 && (
                                <li className="text-warning">
                                    {incompleteCount} estudiante(s) tienen nota parcial y se registrarán con observaciones.
                                </li>
                            )}
                        </ul>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 border border-stroke rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmOfficial}
                                className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors"
                            >
                                Sí, confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: confirmar guardar borrador ───────────────────────── */}
            {showDraftConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                                <Save size={20} className="text-warning" />
                            </div>
                            <h3 className="text-base font-semibold text-black dark:text-white">
                                Guardar borrador
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                            Se guardará el estado actual del consolidado como borrador.
                            Las notas <strong>no quedarán bloqueadas</strong> y podrá seguir
                            editando las calificaciones.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDraftConfirm(false)}
                                className="px-4 py-2 border border-stroke rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveDraft}
                                className="px-5 py-2 bg-warning text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors"
                            >
                                Guardar borrador
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterFinalGradePage;