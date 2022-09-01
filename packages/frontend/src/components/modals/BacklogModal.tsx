import { Avatar, Button, Col, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import './BacklogModal.css';

const { Option } = Select;
const { TextArea } = Input;

function BacklogModal(): JSX.Element {
  // These constants will most likely be passed down as props or
  // fetched from an API. Currently hardcoded for developement.
  const TYPES: BacklogSelect[] = [
    { id: 'story', name: 'Story' },
    { id: 'task', name: 'Task' },
    { id: 'bug', name: 'Bug' },
  ];
  const PRIORITIES: BacklogSelect[] = [
    { id: 'very_high', name: 'Very High' },
    { id: 'high', name: 'High' },
    { id: 'medium', name: 'Medium' },
    { id: 'low', name: 'Low' },
    { id: 'very_low', name: 'Very Low' },
  ];
  const SPRINTS: BacklogSelect[] = [
    { id: '1', name: 'Sprint 1' },
    { id: '2', name: 'Sprint 2' },
    { id: '3', name: 'Sprint 3' },
  ];
  const USERS = [
    { id: 1, name: 'User1' },
    { id: 2, name: 'User2' },
  ];

  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFormSubmit = async (data: FormData): Promise<void> => {
    setIsLoading(true);

    // for development
    const payload: BacklogFormFields = {
      ...data,
      projectId: 123,
    };
    try {
      const res = await fetch('http://localhost:3001/newBacklog', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.status !== 200) {
        console.error('Something went wrong. Please try again');
      }

      setIsModalVisible(false);
      form.resetFields();
      console.log('Success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFooter = (): JSX.Element[] => [
    <Button form="newBacklog" key="submit" type="primary" htmlType="submit" loading={isLoading}>
      Create
    </Button>,
  ];

  const renderTypeSelect = (): JSX.Element => (
    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
      <Select className="type-select" placeholder="Type of backlog">
        {TYPES.map((type) => (
          <Option key={type.id} value={type.id}>
            {type.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderSprintSelect = (): JSX.Element => (
    <Form.Item name="sprintId" label="Sprint">
      <Select className="sprint-select" placeholder="Select Sprint" allowClear>
        {SPRINTS.map((sprint) => (
          <Option key={sprint.id} value={sprint.id}>
            {sprint.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderPrioritySelect = (): JSX.Element => (
    <Form.Item name="priority" label="Priority">
      <Select className="priority-select" placeholder="Select Priority" allowClear>
        {PRIORITIES.map((priority) => (
          <Option key={priority.id} value={priority.id}>
            {priority.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderReporterSelect = (): JSX.Element => (
    <Form.Item name="reporterId" label="Reporter" rules={[{ required: true }]}>
      <Select className="reporter-select">
        {USERS.map((user) => (
          <Option key={user.id} value={user.id}>
            <Avatar className="reporter-avatar" style={{ backgroundColor: '#85041C' }} icon={<UserOutlined />} />
            <span className="select-username-text">{user.name}</span>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderAssigneeSelect = (): JSX.Element => (
    <Form.Item name="assigneeId" label="Assignee">
      <Select className="assignee-select" allowClear>
        {USERS.map((user) => (
          <Option key={user.id} value={user.id}>
            <Avatar className="assignee-avatar" style={{ backgroundColor: '#ccc' }} icon={<UserOutlined />} />
            <span className="select-username-text">{user.name}</span>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderContent = (): JSX.Element => (
    <Form id="newBacklog" form={form} onFinish={handleFormSubmit}>
      <Form.Item name="summary" rules={[{ required: true }]}>
        <Input className="summary-input" placeholder="* Type summary here..." />
      </Form.Item>
      {renderTypeSelect()}
      {renderSprintSelect()}
      {renderPrioritySelect()}
      <Row>
        <Col span={12}>{renderReporterSelect()}</Col>
        <Col span={12}>{renderAssigneeSelect()}</Col>
      </Row>
      <Form.Item name="points" label="Points">
        <InputNumber className="points-input" min={1} />
      </Form.Item>
      <Form.Item name="description">
        <TextArea className="description-textarea" placeholder="Description..." autoSize={{ minRows: 5, maxRows: 8 }} />
      </Form.Item>
    </Form>
  );

  return (
    <>
      <Button type="primary" onClick={showModal}>
        New Backlog
      </Button>
      <Modal
        title="New Backlog"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={renderFooter()}
        width={600}
      >
        {renderContent()}
      </Modal>
    </>
  );
}

interface BacklogFormFields extends FormData {
  projectId: number;
}

type BacklogSelect = {
  id: string;
  name: string;
};

export default BacklogModal;
