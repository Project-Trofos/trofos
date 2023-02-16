import { message } from 'antd';
import { useCallback } from 'react';
import { getErrorMessage } from '../../helpers/error';
import {
  useCreateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetFeedbacksQuery,
  useUpdateFeedbackMutation,
} from '../feedback';

export function useFeedback() {
  const { data: allFeedbacks } = useGetFeedbacksQuery();
  const [createFeedback] = useCreateFeedbackMutation();
  const [updateFeedback] = useUpdateFeedbackMutation();
  const [deleteFeedback] = useDeleteFeedbackMutation();

  const getFeedbackBySprintId = useCallback(
    (sprintId: number) => {
      if (!allFeedbacks) {
        return undefined;
      }
      return allFeedbacks.find((f) => f.sprint_id === sprintId);
    },
    [allFeedbacks],
  );

  const handleCreateFeedback = async (sprintId: number, content: string) => {
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

  return { allFeedbacks, getFeedbackBySprintId, handleCreateFeedback, handleUpdateFeedback, handleDeleteFeedback };
}
