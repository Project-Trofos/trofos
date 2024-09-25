import React, { useCallback } from 'react';
import { Form, Select, message } from 'antd';
import { Dayjs } from 'dayjs';
import MultistepFormModal from './MultistepModalForm';
import { getErrorMessage } from '../../helpers/error';
import StandUpForm from '../forms/StandUpForm';
import { useAddStandUpMutation } from '../../api/socket/standUpHooks';

const { Option } = Select;

/**
 * Modal for scheduling stand ups
 * @param course course that the project will attach to, skips second step
 */
// eslint-disable-next-line react/require-default-props
export default function StandUpCreationModal({ projectId, isToday }: { projectId: number, isToday?: boolean }): JSX.Element {
  const [addStandUp] = useAddStandUpMutation();

  const onFinish = useCallback(
    async (data: { date: Dayjs }) => {
      try {
        const { date } = data;
        if (!date) {
          throw new Error('Please provide a date!');
        }

        await addStandUp({ project_id: projectId, date: date.toDate() }).unwrap();
        message.success(`Stand up scheduled for ${date}!`);
      } catch (err) {
        message.error(getErrorMessage(err));
        throw err;
      }
    },
    [addStandUp, projectId],
  );

  return (
    <MultistepFormModal
      title={isToday? "Schedule Stand up for today": "Schedule Stand Up"}
      buttonChildren={isToday? "Schedule Stand up for today": "Schedule Stand Up"}
      formName="stand-up-creation-form"
      formSteps={[<StandUpForm isToday={isToday} />]}
      onSubmit={onFinish}
      buttonType="primary"
    />
  );
}
