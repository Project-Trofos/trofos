import React, { useCallback } from 'react';
import { Form, message } from 'antd';
import { Dayjs } from 'dayjs';
import { useCreateMilestoneMutation } from '../../api/course';
import MultistepFormModal from './MultistepModalForm';
import { getErrorMessage } from '../../helpers/error';
import StringFormItem from '../forms/StringFormItem';
import { DatePicker } from '../datetime';

/**
 * Modal for creating milestone
 */
export default function MilestoneCreationModal({ courseId }: { courseId: string }) {
  const [createMilestone] = useCreateMilestoneMutation();

  const [form] = Form.useForm();

  const onFinish = useCallback(
    async (values: { milestoneName: string; dates: [Dayjs | undefined, Dayjs | undefined] }) => {
      try {
        const { milestoneName, dates } = values;

        if (!dates[0] || !dates[1]) {
          throw new Error('Please select a valid date range!');
        }

        await createMilestone({
          courseId,
          milestoneStartDate: dates[0].toDate(),
          milestoneDeadline: dates[1].toDate(),
          milestoneName,
        }).unwrap();
        message.success(`Course ${milestoneName} has been created!`);
      } catch (err) {
        message.error(getErrorMessage(err));
        throw err;
      }
    },
    [createMilestone, courseId],
  );

  return (
    <MultistepFormModal
      title="Create Milestone"
      buttonName="Create Milestone"
      form={form}
      onSubmit={onFinish}
      formSteps={[
        <>
          <StringFormItem label="Milestone Name" name="milestoneName" isRequired />
          <Form.Item
            label="Start and end dates"
            name="dates"
            rules={[{ required: true, message: `Please input start and end dates!` }]}
          >
            <DatePicker.RangePicker onCalendarChange={(e) => {}} />
          </Form.Item>
        </>,
      ]}
    />
  );
}
