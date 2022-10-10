import React from 'react';
import { Typography, Row, Col, Form, Button, message } from 'antd';
import OldPasswordFormItem from '../forms/OldPasswordFormItem';
import NewPasswordFormItem from '../forms/NewPasswordFormItem';
import { ChangePassword, useChangePasswordMutation, useGetUserInfoQuery } from '../../api/auth';

/**
 * Change password tab for account
 */
export default function ChangePasswordTab(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();
  const [changePassword] = useChangePasswordMutation();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const changePasswordBody: ChangePassword = {
      userId: userInfo?.userId,
      oldUserPassword: values.oldPassword,
      newUserPassword: values.newPassword,
    };
    try {
      await changePassword(changePasswordBody).unwrap();
      message.success('Password Changed Successfully', 5);
      form.resetFields();
    } catch (error: any) {
      message.error(error.data.error, 5);
    }
  };

  return (
    <Row>
      <Col offset={6} span={12}>
        <Typography.Title level={2}>Change Password</Typography.Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <OldPasswordFormItem />
          <NewPasswordFormItem />
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
}
