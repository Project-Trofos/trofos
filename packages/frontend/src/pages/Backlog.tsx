import React, { useEffect } from 'react';
import { Card, Form, message, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetBacklogQuery, useGetBacklogsByEpicIdQuery, useGetEpicsByProjectIdQuery } from '../api/backlog';
import { useUpdateBacklogMutation, useAddBacklogToEpicMutation } from '../api/socket/backlogHooks';
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
import BacklogList from '../components/lists/BacklogList';
import StrictModeDroppable from '../components/dnd/StrictModeDroppable';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { BACKLOG_TYPE_OPTIONS } from '../helpers/constants';

function Backlog(): JSX.Element {
  const { Title } = Typography;
  const params = useParams();
  const [form] = Form.useForm();
  const [updateBacklog] = useUpdateBacklogMutation();

  const TYPES: BacklogSelectTypes[] = BACKLOG_TYPE_OPTIONS.map((type) => (
    {
      id: type.value,
      name: type.value,
      labelComponent: type.label,
    }
  ))


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
  const { data: epicData } = useGetEpicsByProjectIdQuery({ projectId: projectId });
  const relatedBacklogs = useGetBacklogsByEpicIdQuery({ epicId: backlog?.epic_id ?? -1 }).data?.filter((b)=>(b.backlog_id !== backlog?.backlog_id)) ?? [];

  useEffect(() => {
    form.setFieldsValue(backlog);
  }, [form, backlog]);

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
                  <BacklogTextArea onBlur={handleDescriptionFieldUpdate} autoSize={{ minRows: 12, maxRows: 12 }} />
                </Form.Item>
              </div>
            </div>
            <div className="backlog-sidebar-container">
              <Form.Item name="status">
                <BacklogStatusSelect status={projectData?.backlogStatuses || []} />
              </Form.Item>
              <Card className="backlog-panel-container">
                <div>
                  <label>Assignee</label>
                  <Form.Item name="assignee_id">
                    <BacklogUserSelect options={projectData?.users || []} allowClear />
                  </Form.Item>
                </div>
                <div>
                  <label>Type</label>
                  <Form.Item name="type" rules={[{ required: true }]}>
                    <BacklogSelect options={TYPES} />
                  </Form.Item>
                </div>
                <div>
                  <label>Priority</label>
                  <Form.Item name="priority">
                    <BacklogSelect options={PRIORITIES} allowClear />
                  </Form.Item>
                </div>
                <div>
                  <label>Sprint</label>
                  <Form.Item name="sprint_id">
                    <BacklogSelect options={projectData?.sprints || []} allowClear />
                  </Form.Item>
                </div>
                <div>
                  <label>Epic</label>
                  <Form.Item name="epic_id">
                    <BacklogSelect
                      options={epicData ? epicData.map((e) => ({ id: e.epic_id, name: e.name })) : []}
                      placeholder="Select Epic"
                      allowClear
                    />
                  </Form.Item>
                </div>
                <div>
                  <label>Point(s)</label>
                  <Form.Item name="points">
                    <BacklogInputNumber onBlur={handlePointsFieldUpdate} />
                  </Form.Item>
                </div>
                <div>
                  <label>Reporter</label>
                  <Form.Item name="reporter_id" rules={[{ required: true }]}>
                    <BacklogUserSelect options={projectData?.users || []} />
                  </Form.Item>
                </div>
              </Card>
              <div className="backlog-menu-container">
                <BacklogMenu projectId={projectId} backlogId={backlogId} />
              </div>
            </div>
          </div>
        </Form>
      </div>
      {relatedBacklogs.length > 0 ?
      <div className="related-container">
        <Title level={2}>Related Backlogs In The Same Epic</Title>
        <DragDropContext onDragEnd={async (result: DropResult) => {}}>
          <StrictModeDroppable droppableId="null">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <BacklogList backlogs={relatedBacklogs} />
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>
      </div> : <></>}
      <div className="comment-container">
        <Title level={2}>Comments</Title>
        <BacklogComment />
        <Comment />
      </div>
    </>
  );
}

export default Backlog;
