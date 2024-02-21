import React from 'react';
import { DatePicker, Form } from 'antd';

// Renders form elements to input project name
export default function StandUpForm(): JSX.Element {
  return (
    <Form.Item label="Date" name="date" required rules={[{ required: true, message: 'Please set a date!' }]}>
      <DatePicker />
    </Form.Item>
  );
}
