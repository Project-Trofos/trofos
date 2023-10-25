import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, FormProps, Input, Layout, message, Space, Typography } from 'antd';
import './Login.css';
import Title from 'antd/es/typography/Title';
import { useLoginUserMutation, UserLoginInfo } from '../api/auth';
import NusSsoButton from '../components/button/NusSsoButton';
import { Heading } from '../components/typography';

export default function LoginPage(): JSX.Element {
  const [loginUser] = useLoginUserMutation();

  const navigate = useNavigate();

  const onFinish = async (userLoginInfo: UserLoginInfo) => {
    try {
      await loginUser(userLoginInfo).unwrap();
      navigate('/projects');
    } catch (err: any) {
      message.error(err.data);
    }
  };

  const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
    console.error('Failed:', errorInfo);
  };

  return (
    <Layout className="main">
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <div className="sso">
          <Heading>Trofos</Heading>
          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="userEmail"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input />
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
                Sign in
              </Button>
            </Form.Item>
          </Form>
          <Typography>Sign in with</Typography>
          <NusSsoButton />
        </div>
      </Space>
    </Layout>
  );
}
