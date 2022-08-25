import React from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { createProject } from '../../api/project';

/**
 * Modal for creating projects
 */
export default function ProjectCreationModal(props: {
  isModalVisible: boolean;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { isModalVisible, setIsModalVisible } = props;

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = (values: { projectKey: string; projectName: string }) => {
    createProject({ id: values.projectName, name: values.projectName, key: values.projectKey });
    handleOk();
  };

  return (
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
  );
}
