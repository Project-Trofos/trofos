import React from 'react';
import { Form, Input } from 'antd';

// Renders form elements to input project name
export default function ProjectNameFormInput(): JSX.Element {
  return (
    <Form.Item
      label="Name"
      name="projectName"
      required
      rules={[{ required: true, message: "Please input your project's name!" }]}
    >
      <Input />
    </Form.Item>
  );
}
