import { message } from 'antd';
import { getErrorMessage } from '../../helpers/error';
import { confirmBulkResetSprintGradesOnMaxMarksChange } from '../../components/modals/confirm';
import {
  useAssignTaForSprintMutation,
  useAssignTaMutation,
  useBulkSetSprintMaxMarksMutation,
  useGetGradesByCourseQuery,
  useGetGradesByProjectQuery,
  usePublishGradeMutation,
  useUnpublishGradeMutation,
  useUpsertMilestoneGradeMutation,
  useUpsertSprintGradeMutation,
} from '../grade';

export function useCourseGrades(courseId: number) {
  const { data, isLoading } = useGetGradesByCourseQuery(courseId);
  const [publishGrade] = usePublishGradeMutation();
  const [unpublishGrade] = useUnpublishGradeMutation();
  const [assignTa] = useAssignTaMutation();
  const [assignTaForSprint] = useAssignTaForSprintMutation();
  const [bulkSetSprintMaxMarks] = useBulkSetSprintMaxMarksMutation();

  const handlePublishGrade = async (projectId: number, gradeId: number) => {
    try {
      await publishGrade({ projectId, gradeId }).unwrap();
      message.success('Grade published!');
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const handleUnpublishGrade = async (projectId: number, gradeId: number) => {
    try {
      await unpublishGrade({ projectId, gradeId }).unwrap();
      message.success('Grade reverted to draft!');
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const handleAssignTa = async (projectId: number, milestoneId: number, assignedTaId: number | null) => {
    try {
      await assignTa({ projectId, milestoneId, assignedTaId }).unwrap();
      message.success('Assigned TA updated!');
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const handleAssignTaForSprint = async (projectId: number, sprintId: number, assignedTaId: number | null) => {
    try {
      await assignTaForSprint({ projectId, sprintId, assignedTaId }).unwrap();
      message.success('Assigned TA updated!');
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const handleBulkSetSprintMaxMarks = async (sprintIds: number[], maxMarks: number) => {
    try {
      await bulkSetSprintMaxMarks({ courseId, sprintIds, maxMarks }).unwrap();
      message.success('Total marks updated!');
    } catch (e) {
      const err = e as { status?: number; data?: { details?: { affectedGradeCount: number } } };
      if (err.status === 409 && err.data?.details) {
        confirmBulkResetSprintGradesOnMaxMarksChange(sprintIds.length, err.data.details.affectedGradeCount, async () => {
          await bulkSetSprintMaxMarks({ courseId, sprintIds, maxMarks, confirm: true }).unwrap();
          message.success('Total marks updated!');
        });
        return;
      }
      message.error(getErrorMessage(e));
    }
  };

  return {
    grades: data?.grades,
    isLoading,
    handlePublishGrade,
    handleUnpublishGrade,
    handleAssignTa,
    handleAssignTaForSprint,
    handleBulkSetSprintMaxMarks,
  };
}

export function useProjectGrades(projectId: number) {
  const { data, isLoading } = useGetGradesByProjectQuery(projectId);
  const [upsertMilestoneGrade] = useUpsertMilestoneGradeMutation();
  const [upsertSprintGrade] = useUpsertSprintGradeMutation();

  const handleUpsertMilestoneGrade = async (milestoneId: number, payload: { score?: number; comment?: string }) => {
    try {
      await upsertMilestoneGrade({ projectId, milestoneId, ...payload }).unwrap();
      message.success('Grade saved!');
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const handleUpsertSprintGrade = async (sprintId: number, payload: { score?: number; comment?: string }) => {
    try {
      await upsertSprintGrade({ projectId, sprintId, ...payload }).unwrap();
      message.success('Grade saved!');
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  return {
    grades: data?.grades,
    isLoading,
    handleUpsertMilestoneGrade,
    handleUpsertSprintGrade,
  };
}
