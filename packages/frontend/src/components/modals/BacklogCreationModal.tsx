import React, { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'antd';
import { useParams } from 'react-router-dom';
import { useAddBacklogMutation } from '../../api/backlog';
import BacklogSummaryInput from '../fields/BacklogSummaryInput';
import BacklogSelect from '../fields/BacklogSelect';
import BacklogUserSelect from '../fields/BacklogUserSelect';
import BacklogInputNumber from '../fields/BacklogInputNumber';
import BacklogTextArea from '../fields/BacklogTextArea';
import type { BacklogSelectTypes, BacklogFormFields } from '../../helpers/BacklogModal.types';
import './BacklogCreationModal.css';

function BacklogCreationModal(): JSX.Element {
  // These constants will most likely be passed down as props or
  // fetched from an API. Currently hardcoded for developement.
  const TYPES: BacklogSelectTypes[] = [
    { id: 'story', name: 'Story' },
    { id: 'task', name: 'Task' },
    { id: 'bug', name: 'Bug' },
  ];
  const PRIORITIES: BacklogSelectTypes[] = [
    { id: 'very_high', name: 'Very High' },
    { id: 'high', name: 'High' },
    { id: 'medium', name: 'Medium' },
    { id: 'low', name: 'Low' },
    { id: 'very_low', name: 'Very Low' },
  ];
  const SPRINTS = [{ id: 1, name: 'Sprint 1' }];
  const USERS = [
    { id: 901, name: 'User1' },
    { id: 902, name: 'User2' },
  ];

  const params = useParams();
  const [form] = Form.useForm();

  const [addBacklog] = useAddBacklogMutation();

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

    const payload: BacklogFormFields = {
      ...data,
      projectId: Number(params.projectId),
    };

    try {
      await addBacklog(payload).unwrap();
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
      <BacklogSelect options={TYPES} placeholder="Type of backlog" />
    </Form.Item>
  );

  const renderSprintSelect = (): JSX.Element => (
    <Form.Item name="sprintId" label="Sprint">
      <BacklogSelect options={SPRINTS} placeholder="Select Sprint" allowClear />
    </Form.Item>
  );

  const renderPrioritySelect = (): JSX.Element => (
    <Form.Item name="priority" label="Priority">
      <BacklogSelect options={PRIORITIES} placeholder="Select Priority" allowClear />
    </Form.Item>
  );

  const renderReporterSelect = (): JSX.Element => (
    <Form.Item name="reporterId" label="Reporter" rules={[{ required: true }]}>
      <BacklogUserSelect options={USERS} placeholder="Select User" />
    </Form.Item>
  );

  const renderAssigneeSelect = (): JSX.Element => (
    <Form.Item name="assigneeId" label="Assignee">
      <BacklogUserSelect options={USERS} placeholder="Assign to" allowClear />
    </Form.Item>
  );

  const renderContent = (): JSX.Element => (
    <Form id="newBacklog" form={form} onFinish={handleFormSubmit}>
      <Form.Item name="summary" rules={[{ required: true }]} initialValue="">
        <BacklogSummaryInput placeholder="* Type summary here..." />
      </Form.Item>
      {renderTypeSelect()}
      {renderSprintSelect()}
      {renderPrioritySelect()}
      <Row>
        <Col span={12}>{renderReporterSelect()}</Col>
        <Col span={12}>{renderAssigneeSelect()}</Col>
      </Row>
      <Form.Item name="points" label="Points">
        <BacklogInputNumber />
      </Form.Item>
      <Form.Item name="description">
        <BacklogTextArea placeholder="Description..." autoSize={{ minRows: 5, maxRows: 8 }} />
      </Form.Item>
    </Form>
  );

  return (
    <>
      <Button className="new-backlog-btn" type="primary" onClick={showModal}>
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

export default BacklogCreationModal;