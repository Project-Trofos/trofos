import React from 'react';
import { Form, message, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetBacklogQuery } from '../api/backlog';
import { useUpdateBacklogMutation } from '../api/socket/backlogHooks';
import BacklogInputNumber from '../components/fields/BacklogInputNumber';
import BacklogSelect from '../components/fields/BacklogSelect';
import BacklogSummaryInput from '../components/fields/BacklogSummaryInput';
import BacklogTextArea from '../components/fields/BacklogTextArea';
import BacklogUserSelect from '../components/fields/BacklogUserSelect';
import { BacklogSelectTypes } from '../helpers/BacklogModal.types';
import type { Backlog as BacklogType } from '../api/types';
import BacklogMenu from '../components/dropdowns/BacklogMenu';
import { useGetProjectQuery } from '../api/project';
import BacklogStatusSelect from '../components/fields/BacklogStatusSelect';
import Comment from '../components/lists/Comment';
import './Backlog.css';
import BacklogComment from '../components/fields/BacklogComment';

function Backlog(): JSX.Element {
  const { Title } = Typography;
  const params = useParams();
  const [form] = Form.useForm();
  const [updateBacklog] = useUpdateBacklogMutation();

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

  const projectId = Number(params.projectId);
  const backlogId = Number(params.backlogId);
  const { data: projectData } = useGetProjectQuery({ id: projectId });
  const { data: backlog } = useGetBacklogQuery({ projectId, backlogId });

  const removeUnchangedFields = (payload: { [key: string]: string | number | null }) => {
    const updatedPayload: { [key: string]: string | number | null } = {};
    for (const [key, value] of Object.entries(payload)) {
      if (backlog?.[key as keyof BacklogType] !== payload[key]) {
        updatedPayload[key] = value;
      }
    }
    return updatedPayload;
  };

  const shouldUpdateBacklog = (updatedPayload: { [key: string]: string | number | null }) =>
    Object.keys(updatedPayload).length !== 0;

  const handleUpdateBacklog = async (payload: { [key: string]: string | number | null }) => {
    // only update if fields have changed
    const updatedPayload = removeUnchangedFields(payload);
    if (!shouldUpdateBacklog(updatedPayload)) {
      return;
    }

    const backlogToUpdate = {
      projectId,
      backlogId,
      fieldToUpdate: updatedPayload,
    };

    message.loading({ content: 'Updating...', key: 'backlogUpdateMessage' });

    try {
      await updateBacklog(backlogToUpdate).unwrap();
      message.success({ content: 'Backlog updated', key: 'backlogUpdateMessage' });
    } catch (e) {
      message.error({ content: 'Failed to update backlog', key: 'backlogUpdateMessage' });
      console.error(e);
    }
  };

  const handleSelectFieldsUpdate = (updatedField: { name: string; value: string | number | undefined }) => {
    if ('summary' in updatedField || 'description' in updatedField || 'points' in updatedField) {
      return;
    }
    const payload: { [key: string]: string | number | null } = {};

    for (const [key, value] of Object.entries(updatedField)) {
      payload[key] = value || null;
    }

    handleUpdateBacklog(payload);
  };

  const handleSummaryFieldUpdate = () => {
    const updatedSummary = form.getFieldValue('summary');
    if (!updatedSummary) {
      return;
    }
    const payload = {
      summary: updatedSummary,
    };
    handleUpdateBacklog(payload);
  };

  const handleDescriptionFieldUpdate = () => {
    const updatedDesciption: string = form.getFieldValue('description');
    const payload = {
      description: updatedDesciption || null,
    };
    handleUpdateBacklog(payload);
  };

  const handlePointsFieldUpdate = () => {
    const updatedPoints = form.getFieldValue('points');
    const payload = {
      points: updatedPoints || null,
    };
    handleUpdateBacklog(payload);
  };

  if (!backlog) {
    return <h1>Unable to get backlog. Please try again.</h1>;
  }

  return (
    <>
      <div>
        <Form
          form={form}
          initialValues={backlog}
          onValuesChange={handleSelectFieldsUpdate}
          className="backlog-page-container"
        >
          <div className="backlog-data-container">
            <div className="backlog-input-container">
              <Form.Item name="summary" rules={[{ required: true }]}>
                <BacklogSummaryInput onBlur={handleSummaryFieldUpdate} />
              </Form.Item>
              <div className="backlog-description-container">
                <p>Description:</p>
                <Form.Item name="description">
                  <BacklogTextArea onBlur={handleDescriptionFieldUpdate} autoSize={{ minRows: 1, maxRows: 11 }} />
                </Form.Item>
              </div>
            </div>
            <div className="backlog-sidebar-container">
              <Form.Item name="status">
                <BacklogStatusSelect status={projectData?.backlogStatuses || []} />
              </Form.Item>
              <div className="backlog-panel-container">
                <div>
                  <span>Assignee</span>
                  <Form.Item name="assignee_id">
                    <BacklogUserSelect options={projectData?.users || []} allowClear />
                  </Form.Item>
                </div>
                <div>
                  <span>Type</span>
                  <Form.Item name="type" rules={[{ required: true }]}>
                    <BacklogSelect options={TYPES} />
                  </Form.Item>
                </div>
                <div>
                  <span>Priority</span>
                  <Form.Item name="priority">
                    <BacklogSelect options={PRIORITIES} allowClear />
                  </Form.Item>
                </div>
                <div>
                  <span>Sprint</span>
                  <Form.Item name="sprint_id">
                    <BacklogSelect options={projectData?.sprints || []} allowClear />
                  </Form.Item>
                </div>
                <div>
                  <span>Point(s)</span>
                  <Form.Item name="points">
                    <BacklogInputNumber onBlur={handlePointsFieldUpdate} />
                  </Form.Item>
                </div>
                <div>
                  <span>Reporter</span>
                  <Form.Item name="reporter_id" rules={[{ required: true }]}>
                    <BacklogUserSelect options={projectData?.users || []} />
                  </Form.Item>
                </div>
              </div>
              <div className="backlog-menu-container">
                <BacklogMenu projectId={projectId} backlogId={backlogId} />
              </div>
            </div>
          </div>
        </Form>
      </div>
      <div className="comment-container">
        <Title level={2}>Comments</Title>
        <BacklogComment />
        <Comment />
      </div>
    </>
  );
}

export default Backlog;
