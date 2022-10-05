import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';

// Renders form elements to input course code

type CourseCodeFormItemProps = {
  disabled?: boolean;
  required?: boolean;
};
export default function CourseCodeFormItem({ disabled, required }: CourseCodeFormItemProps): JSX.Element {
  return (
    <Form.Item
      label="Course Code"
      name="courseCode"
      rules={required ? [{ required: true, message: "Please input your course's code!" }] : []}
      tooltip={{
        title: 'Course code will be used to uniquely identify this course.',
        icon: <InfoCircleOutlined />,
      }}
    >
      <Input disabled={disabled} />
    </Form.Item>
  );
}

CourseCodeFormItem.defaultProps = {
  disabled: false,
  required: false,
};
