import React from 'react';
import { Form, Button } from 'antd';

type FormProps = React.ComponentProps<typeof Form>;

type DefaultFormProps = {
  initialValues: FormProps['initialValues'];
  onFinish: FormProps['onFinish'];
  isUpdating?: boolean;
  children: React.ReactNode;
};

export default function DefaultForm({ initialValues, onFinish, isUpdating, children }: DefaultFormProps): JSX.Element {
  return (
    <Form layout="vertical" initialValues={initialValues} onFinish={onFinish}>
      {children}
      <Button type="primary" htmlType="submit" loading={isUpdating}>
        Update
      </Button>
    </Form>
  );
}
