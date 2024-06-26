import React from 'react';
import { Form, Input } from 'antd';

type NewPasswordFormItemProps = {
  isNewPassword?: boolean;
};

export default function NewPasswordFormItem({ isNewPassword }: NewPasswordFormItemProps): JSX.Element {
  return (
    <>
      <Form.Item
        label={isNewPassword ? 'New password' : 'Password'}
        name="newPassword"
        rules={[
          {
            required: true,
            message: 'Please enter a new password',
          },
          {
            min: 8,
            message: 'Password must be atleast 8 characters long',
          },
        ]}
      >
        <Input type="password" />
      </Form.Item>
      <Form.Item
        label={isNewPassword ? 'Confirm new password' : 'Confirm Password'}
        name="confirmNewPassword"
        dependencies={['newPassword']}
        rules={[
          {
            required: true,
            message: 'Please confirm your password',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The two passwords that you entered do not match!'));
            },
          }),
        ]}
      >
        <Input type="password" />
      </Form.Item>
    </>
  );
}

NewPasswordFormItem.defaultProps = {
  isNewPassword: true,
};
