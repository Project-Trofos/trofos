import { message } from 'antd';
import { getErrorMessage } from '../../helpers/error';
import {
  useAssignTaMutation,
  useGetGradesByCourseQuery,
  useGetGradesByProjectQuery,
  usePublishGradeMutation,
  useUnpublishGradeMutation,
  useUpsertMilestoneGradeMutation,
} from '../grade';

export function useCourseGrades(courseId: number) {
  const { data, isLoading } = useGetGradesByCourseQuery(courseId);
  const [publishGrade] = usePublishGradeMutation();
  const [unpublishGrade] = useUnpublishGradeMutation();
  const [assignTa] = useAssignTaMutation();

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

  return {
    grades: data?.grades,
    isLoading,
    handlePublishGrade,
    handleUnpublishGrade,
    handleAssignTa,
  };
}

export function useProjectGrades(projectId: number) {
  const { data, isLoading } = useGetGradesByProjectQuery(projectId);
  const [upsertMilestoneGrade] = useUpsertMilestoneGradeMutation();

  const handleUpsertMilestoneGrade = async (milestoneId: number, payload: { score?: number; comment?: string }) => {
    try {
      await upsertMilestoneGrade({ projectId, milestoneId, ...payload }).unwrap();
      message.success('Grade saved!');
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  return {
    grades: data?.grades,
    isLoading,
    handleUpsertMilestoneGrade,
  };
}
