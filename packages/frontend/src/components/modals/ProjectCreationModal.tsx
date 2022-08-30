import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../app/hooks';
import { addProject } from '../../reducers/projectsReducer';


/**
 * Modal for creating projects
 */
export default function ProjectCreationModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useAppDispatch();

  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = (values: { projectKey: string; projectName: string }) => {
    dispatch(addProject({ id: values.projectName, name: values.projectName, key: values.projectKey }));
    handleOk();
  };

  return (
    <>
      <Button onClick={showModal} type="primary">
        Create Project
      </Button>
      <Modal
        title="Create Project"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button type="primary" form="project-creation-form" key="submit" htmlType="submit">
            Create
          </Button>,
        ]}
      >
        <p>You can change these details anytime in your project settings.</p>
        <Form
          name="project-creation-form"
          form={form}
          layout="vertical"
          wrapperCol={{ span: 20 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="projectName"
            required
            rules={[{ required: true, message: "Please input your project's name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Key"
            name="projectKey"
            rules={[{ pattern: /[\d\w]*/, message: 'The key must be alphanumeric' }]}
            tooltip={{ title: 'This key will be used as a prefix to the issues.', icon: <InfoCircleOutlined /> }}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}