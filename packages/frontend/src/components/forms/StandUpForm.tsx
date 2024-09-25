import React from 'react';
import { DatePicker, Form } from 'antd';
import dayjs from 'dayjs';

type StandUpFormProps = {
  isToday?: boolean;
};

// Renders form elements to input project name
export default function StandUpForm({ isToday }: StandUpFormProps): JSX.Element {
  return (
    isToday ? (
      <Form.Item
        label="Date"
        name="date"
        required
        rules={[{ required: true, message: 'Please set a date!' }]}
        initialValue={dayjs()}
        >
        <DatePicker
          defaultValue={dayjs()}
          disabled
        />
      </Form.Item>
    ) : (
      <Form.Item label="Date" name="date" required rules={[{ required: true, message: 'Please set a date!' }]}>
        <DatePicker />
      </Form.Item>
    )
  );
}
