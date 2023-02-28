import { message } from 'antd';
import { getErrorMessage } from '../../helpers/error';
import {
  useCreateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetFeedbacksBySprintIdQuery,
  useUpdateFeedbackMutation,
} from '../feedback';

export function useFeedbackBySprint(projectId: number, sprintId: number) {
  const { data: feedbacks } = useGetFeedbacksBySprintIdQuery({ sprintId, projectId });
  const [createFeedback] = useCreateFeedbackMutation();
  const [updateFeedback] = useUpdateFeedbackMutation();
  const [deleteFeedback] = useDeleteFeedbackMutation();

  const handleCreateFeedback = async (content: string) => {
    try {
      await createFeedback({ sprint_id: sprintId, content, projectId }).unwrap();
      message.success('Feedback created!');
    } catch (e) {
      console.log(getErrorMessage(e));
      message.error('Failed to create feedback');
    }
  };

  const handleUpdateFeedback = async (feedbackId: number, content: string) => {
    try {
      await updateFeedback({ id: feedbackId, content, projectId }).unwrap();
      message.success('Feedback updated!');
    } catch (e) {
      console.log(getErrorMessage(e));
      message.error('Failed to update feedback');
    }
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    try {
      await deleteFeedback({ id: feedbackId, projectId }).unwrap();
      message.success('Feedback removed!');
    } catch (e) {
      console.log(getErrorMessage(e));
      message.error('Failed to remove feedback');
    }
  };

  return { feedbacks, handleCreateFeedback, handleUpdateFeedback, handleDeleteFeedback };
}
