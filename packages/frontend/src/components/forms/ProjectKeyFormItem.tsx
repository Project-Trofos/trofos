import React from 'react';
import { Form, Input } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

// Renders form elements to input project key
export default function ProjectKeyFormInput({ disabled = false }: { disabled?: boolean }): JSX.Element {
  return (
    <Form.Item
      label="Key"
      name="projectKey"
      rules={[
        { pattern: /^[a-zA-Z0-9-]*$/, message: 'The key must be alphanumeric.' },
        { max: 64, message: 'The key must be at most 64 characters long.' },
      ]}
      tooltip={{ title: 'This key will be used as a prefix to the issues.', icon: <InfoCircleOutlined /> }}
    >
      <Input disabled />
    </Form.Item>
  );
}

ProjectKeyFormInput.defaultProps = {
  disabled: false,
};
