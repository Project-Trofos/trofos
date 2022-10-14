import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';

// Renders form elements to input course code

type CourseCodeFormItemProps = {
  isDisabled?: boolean;
  isRequired?: boolean;
};
export default function CourseCodeFormItem({ isDisabled, isRequired }: CourseCodeFormItemProps): JSX.Element {
  return (
    <Form.Item
      label="Course Code"
      name="courseCode"
      rules={isRequired ? [{ required: true, message: "Please input your course's code!" }] : []}
      tooltip={{
        title: 'Course code will be used to uniquely identify this course.',
        icon: <InfoCircleOutlined />,
      }}
    >
      <Input disabled={isDisabled} />
    </Form.Item>
  );
}
