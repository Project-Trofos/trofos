import React from 'react';
import { Form, Input } from 'antd';

export default function OldPasswordFormItem(): JSX.Element {
  return (
    <Form.Item
      label="Old Password"
      name="oldPassword"
      rules={[
        {
          required: true,
          message: 'Please enter your old password',
        },
      ]}
    >
      <Input type="password" />
    </Form.Item>
  );
}
