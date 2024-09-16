import React, { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'antd';
import { useParams } from 'react-router-dom';
import { useAddBacklogMutation } from '../../api/socket/backlogHooks';
import BacklogSummaryInput from '../fields/BacklogSummaryInput';
import BacklogSelect from '../fields/BacklogSelect';
import BacklogUserSelect from '../fields/BacklogUserSelect';
import BacklogInputNumber from '../fields/BacklogInputNumber';
import BacklogTextArea from '../fields/BacklogTextArea';
import type { BacklogSelectTypes, BacklogFormFields } from '../../helpers/BacklogModal.types';
import './BacklogCreationModal.css';
import { useGetProjectQuery } from '../../api/project';
import { Sprint } from '../../api/sprint';
import { DefaultBacklog } from '../../api/types';
import { useGetEpicsByProjectIdQuery } from '../../api/backlog';

function BacklogCreationModal({
  fixedSprint,
  title,
  defaultBacklog,
}: {
  fixedSprint?: Sprint;
  title?: string;
  defaultBacklog?: DefaultBacklog;
}): JSX.Element {
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

  const params = useParams();
  const [form] = Form.useForm();

  const projectId = Number(params.projectId);

  const [addBacklog] = useAddBacklogMutation();
  const { data: projectData } = useGetProjectQuery({ id: projectId });
  const { data: epicData } = useGetEpicsByProjectIdQuery({ projectId: projectId });

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

  const renderTypeSelect = (): JSX.Element => {
    const defaultType = defaultBacklog?.type ? TYPES.find((p) => p.id === defaultBacklog?.type) : undefined;
    return (
      <Form.Item name="type" label="Type" rules={[{ required: true }]} initialValue={defaultType?.id}>
        <BacklogSelect options={TYPES} placeholder="Type of backlog" defaultValue={defaultType} />
      </Form.Item>
    );
  };

  // Sort sprints by ID desc
  const sprintOptionsDescending = projectData?.sprints
    ? [...projectData.sprints].sort((a, b) => b.id - a.id)
    : [];

  const renderSprintSelect = (): JSX.Element => {
    const fixedSprintValue = fixedSprint ? { id: fixedSprint.id, name: fixedSprint.name } : undefined;
    return (
      <Form.Item name="sprintId" label="Sprint" initialValue={fixedSprint ? fixedSprint.id : undefined}>
        <BacklogSelect
          options={sprintOptionsDescending || []}
          placeholder="Select Sprint"
          allowClear
          fixedValue={fixedSprintValue}
          showSearch
          className='sprint-select'
        />
      </Form.Item>
    );
  };

  const renderEpicSelect = (): JSX.Element => {
    return (
      <Form.Item name="epicId" label="Epic">
        <BacklogSelect
          options={epicData
            ? epicData.map((e) => ({id: e.epic_id, name: e.name})) 
            : []}
          placeholder="Select Epic"
          allowClear
        />
      </Form.Item>
    );
  };

  const renderPrioritySelect = (): JSX.Element => {
    const defaultPriority = defaultBacklog?.priority
      ? PRIORITIES.find((p) => p.id === defaultBacklog?.priority)
      : undefined;
    return (
      <Form.Item name="priority" label="Priority" initialValue={defaultPriority?.id}>
        <BacklogSelect options={PRIORITIES} placeholder="Select Priority" defaultValue={defaultPriority} allowClear />
      </Form.Item>
    );
  };

  const renderReporterSelect = (): JSX.Element => { //todo
    const defaultReporter = defaultBacklog?.reporter_id ?? undefined;
    return (<Form.Item name="reporterId" label="Reporter" rules={[{ required: true }]} initialValue={defaultReporter}>
      <BacklogUserSelect options={projectData?.users || []} placeholder="Select User" />
    </Form.Item>
    );
  };

  const renderAssigneeSelect = (): JSX.Element => (
    <Form.Item name="assigneeId" label="Assignee">
      <BacklogUserSelect options={projectData?.users || []} placeholder="Assign to" allowClear />
    </Form.Item>
  );

  const renderContent = (): JSX.Element => (
    <Form id="newBacklog" form={form} onFinish={handleFormSubmit}>
      <Form.Item name="summary" rules={[{ required: true }]} initialValue={defaultBacklog?.summary ?? ''}>
        <BacklogSummaryInput placeholder="* Type summary here..." defaultValue={defaultBacklog?.summary ?? ''} />
      </Form.Item>
      {renderTypeSelect()}
      {renderSprintSelect()}
      {renderEpicSelect()}
      {renderPrioritySelect()}
      <Row>
        <Col span={12}>{renderReporterSelect()}</Col>
        <Col span={12}>{renderAssigneeSelect()}</Col>
      </Row>
      <Form.Item name="points" label="Points" initialValue={defaultBacklog?.points ?? undefined}>
        <BacklogInputNumber defaultValue={defaultBacklog?.points ?? undefined} />
      </Form.Item>
      <Form.Item name="description">
        <BacklogTextArea placeholder="Description..." autoSize={{ minRows: 5, maxRows: 8 }} />
      </Form.Item>
    </Form>
  );

  return (
    <>
      <Button className="new-backlog-btn" type="primary" onClick={showModal}>
        {title ?? 'New Backlog'}
      </Button>
      <Modal
        title={title ?? 'New Backlog'}
        open={isModalVisible}
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
