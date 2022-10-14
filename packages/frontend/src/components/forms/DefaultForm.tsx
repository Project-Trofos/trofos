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
    <Form labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} initialValues={initialValues} onFinish={onFinish}>
      {children}
      <Form.Item label=" " colon={false}>
        <Button type="primary" htmlType="submit" loading={isUpdating}>
          Update
        </Button>
      </Form.Item>
    </Form>
  );
}
