import { message } from 'antd';
import { getErrorMessage } from '../../helpers/error';
import {
  useCreateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetFeedbacksBySprintIdQuery,
  useUpdateFeedbackMutation,
} from '../feedback';

export function useFeedbackBySprint(sprintId: number) {
  const { data: feedbacks } = useGetFeedbacksBySprintIdQuery({ sprintId });
  const [createFeedback] = useCreateFeedbackMutation();
  const [updateFeedback] = useUpdateFeedbackMutation();
  const [deleteFeedback] = useDeleteFeedbackMutation();

  const handleCreateFeedback = async (content: string) => {
    try {
      await createFeedback({ sprint_id: sprintId, content }).unwrap();
      message.success('Feedback created!');
    } catch (e) {
      console.log(getErrorMessage(e));
      message.error('Failed to create feedback');
    }
  };

  const handleUpdateFeedback = async (feedbackId: number, content: string) => {
    try {
      await updateFeedback({ id: feedbackId, content }).unwrap();
      message.success('Feedback updated!');
    } catch (e) {
      console.log(getErrorMessage(e));
      message.error('Failed to update feedback');
    }
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    try {
      await deleteFeedback({ id: feedbackId }).unwrap();
      message.success('Feedback removed!');
    } catch (e) {
      console.log(getErrorMessage(e));
      message.error('Failed to remove feedback');
    }
  };

  return { feedbacks, handleCreateFeedback, handleUpdateFeedback, handleDeleteFeedback };
}
