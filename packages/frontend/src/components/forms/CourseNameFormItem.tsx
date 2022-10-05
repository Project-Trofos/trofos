import React from 'react';
import { Form, Input } from 'antd';

// Renders form elements to input course name
export default function CourseNameFormItem(): JSX.Element {
  return (
    <Form.Item
      label="Course Name"
      name="courseName"
      rules={[
        { required: true, message: "Please input your course's name!" },
        { pattern: /^[a-zA-Z0-9-]*$/, message: 'The course name must be alphanumeric.' },
        { max: 64, message: 'The key must be at most 64 characters long.' },
      ]}
    >
      <Input />
    </Form.Item>
  );
}
