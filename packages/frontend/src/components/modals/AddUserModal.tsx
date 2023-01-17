import React, { useState } from 'react';
import { Modal, Form, Button, message } from 'antd';
import UserEmailFormItem from '../forms/UserEmailFormItem';
import NewPasswordFormItem from '../forms/NewPasswordFormItem';
import { useCreateUserMutation } from '../../api/user';
import { CreateUserRequest } from '../../api/types';

export default function AddUserModal(): JSX.Element {
  const [createUser] = useCreateUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const submitForm = async () => {
    try {
      await form.validateFields();
      const formValues = form.getFieldsValue();
      const user: CreateUserRequest = {
        userEmail: formValues.userEmail,
        newPassword: formValues.newPassword,
      };
      await createUser(user).unwrap();
      message.success('User Created');
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      console.error(err);
      if (err?.data?.error) {
        message.error(err.data.error);
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={showModal}>Create User</Button>
      <Modal
        title="User Information"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" onClick={submitForm}>
            Create
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <UserEmailFormItem isRequired />
          <NewPasswordFormItem isNewPassword={false} />
        </Form>
      </Modal>
    </>
  );
}
