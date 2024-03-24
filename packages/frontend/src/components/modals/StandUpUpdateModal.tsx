import React from 'react';
import { message } from 'antd';
import { Dayjs } from 'dayjs';
import MultistepFormModal from './MultistepModalForm';
import { getErrorMessage } from '../../helpers/error';
import StandUpForm from '../forms/StandUpForm';
import { useUpdateStandUpMutation } from '../../api/socket/standUpHooks';
import { confirmUpdateStandUp } from './confirm';

/**
 * Modal for scheduling stand ups
 * @param course course that the project will attach to, skips second step
 */
// eslint-disable-next-line react/require-default-props
export default function StandUpUpdateModal({
  standUpId,
  projectId,
  isModalOpen,
  setIsModalOpen,
}: {
  standUpId: number;
  projectId: number;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const [updateStandUp] = useUpdateStandUpMutation();

  const onFinish = async (data: { date: Dayjs }) => {
    try {
      const { date } = data;
      if (!date) {
        throw new Error('Please provide a date!');
      }
      confirmUpdateStandUp(async () => {
        await updateStandUp({ id: standUpId, project_id: projectId, date: date.toDate() }).unwrap();
        message.success('Stand Up updated!');
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <MultistepFormModal
      openState={[isModalOpen, setIsModalOpen]}
      formName={`stand-up-update-form-${standUpId}`}
      title="Update Stand Up"
      formSteps={[<StandUpForm />]}
      buttonElement="none"
      onSubmit={onFinish}
    />
  );
}
