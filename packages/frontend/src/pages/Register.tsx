import { Button, Form, Input, Layout, message } from 'antd';
import React from 'react';
import { Heading } from '../components/typography';
import { RegisterUser } from '../api/types';
import { useRegisterMutation } from '../api/auth';
import { FormProps } from 'antd/lib';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [registerUser] = useRegisterMutation();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const onFinish = async (user: RegisterUser) => {
    try {
      messageApi.open({ key: 'key', type: 'loading', content: 'Registering...' });
      await registerUser(user).unwrap();
      messageApi.info({ key: 'key', type: 'success', content: 'Successfully registered! Returning to login screen.' });
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err: any) {
      messageApi.open({ key: 'key', type: 'error', content: err.data.error });
    }
  };

  const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
    console.error('Failed:', errorInfo);
  };

  return (
    <Layout className="main">
      {contextHolder}
      <Heading>Trofos</Heading>
      <Form
        name="basic"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Display name"
          name="userDisplayName"
          rules={[{ required: true, message: 'Please input your display name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="userEmail" rules={[{ required: true, message: 'Please input your username!' }]}>
          <Input autoFocus />
        </Form.Item>

        <Form.Item
          label="Password"
          name="userPassword"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Register
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default Register;
