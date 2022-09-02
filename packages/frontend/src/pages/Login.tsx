import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Input } from 'antd';
import './Login.css';

export default function LoginPage(): JSX.Element {

  const navigate = useNavigate();

  const onFinish = (values: any) => {
    axios.post('http://localhost:3001/login', values, { withCredentials: true })
      .then((res) => {
        navigate('/projects');
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.error('Failed:', errorInfo);
  };

  return (
    <div className = "main">
      <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 18 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"

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

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  </div>
  );
}
