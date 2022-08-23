import { Avatar, Button, Col, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import './BacklogModal.css';

const { Option } = Select;
const { TextArea } = Input;

function BacklogModal() {
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
  const USERS: BacklogSelect[] = [
    { id: 'user1', name: 'User1' },
    { id: 'user2', name: 'User2' },
  ];

  const [isModalVisible, setIsModalVisible] = useState(true);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderFooter = (): JSX.Element[] => (
    [
      <Button form="newBacklog" key="submit" type="primary" htmlType="submit">
        Create
      </Button>,
    ]
  );

  const renderTypeSelect = () => (
    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
      <Select
        className="type-select"
        placeholder="Type of backlog"
      >
        {TYPES.map(type => <Option key={type.id} value={type.id}>{type.name}</Option>)}
      </Select>
    </Form.Item>
  );

  const renderSprintSelect = () => (
    <Form.Item name="sprint" label="Sprint">
      <Select
        className="sprint-select"
        placeholder="Select Sprint"
        allowClear
      >
        {SPRINTS.map(sprint => <Option key={sprint.id} value={sprint.id}>{sprint.name}</Option>)}
      </Select>
    </Form.Item>
  );

  const renderPrioritySelect = () => (
    <Form.Item name="priority" label="Priority">
      <Select
        className="priority-select"
        placeholder="Select Priority"
        allowClear
      >
        {PRIORITIES.map(priority => <Option key={priority.id} value={priority.id}>{priority.name}</Option>)}
      </Select>
    </Form.Item>
  );

  const renderReporterSelect = () => (
    <Form.Item name="reporter" label="Reporter" rules={[{ required: true }]}>
      <Select className="reporter-select">
        {USERS.map(user => (
          <Option key={user.id} value={user.id}>
            <Avatar className="reporter-avatar" style={{ backgroundColor: '#85041C' }} icon={<UserOutlined />} />
            <span className="select-username-text">{user.name}</span>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderAssigneeSelect = () => (
    <Form.Item name="assignee" label="Assignee">
      <Select className="assignee-select" allowClear>
        {USERS.map(user => (
          <Option key={user.id} value={user.id}>
            <Avatar className="assignee-avatar" style={{ backgroundColor: '#ccc' }} icon={<UserOutlined />} />
            <span className="select-username-text">{user.name}</span>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  const handleFormSubmit = (data: FormData) => {
    console.log('Submitted:', data);
  };

  const renderContent = () => (
    <Form id="newBacklog" onFinish={handleFormSubmit}>
      <Form.Item name="summary" rules={[{ required: true }]}>
        <Input className="summary-input" placeholder="* Type summary here..." />
      </Form.Item>
      {renderTypeSelect()}
      {renderSprintSelect()}
      {renderPrioritySelect()}
      <Row>
        <Col span={12}>
          {renderReporterSelect()}
        </Col>
        <Col span={12}>
          {renderAssigneeSelect()}
        </Col>
      </Row>
      <Form.Item name="points" label="Points">
        <InputNumber className="points-input" min={1} />
      </Form.Item>
      <Form.Item name="description">
        <TextArea
          className="description-textarea"
          placeholder="Description..."
          autoSize={{ minRows: 5, maxRows: 8 }}
        />
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

type BacklogSelect = {
  id: string;
  name: string;
};

export default BacklogModal;
