import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetBacklogQuery } from '../api/backlog';
import BacklogInputNumber from '../components/fields/BacklogInputNumber';
import BacklogSelect from '../components/fields/BacklogSelect';
import BacklogSummaryInput from '../components/fields/BacklogSummaryInput';
import BacklogTextArea from '../components/fields/BacklogTextArea';
import BacklogUserSelect from '../components/fields/BacklogUserSelect';
import { BacklogSelectTypes } from '../helpers/BacklogModal.types';
import './Backlog.css';

function Backlog(): JSX.Element {
  const params = useParams();
  const [form] = Form.useForm();

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

  const projectId = Number(params.projectId);
  const backlogId = Number(params.backlogId);
  const { data: backlog } = useGetBacklogQuery({ projectId, backlogId });

  // const [summary, setSummary] = useState(backlog?.summary);
  // const [description, setDescription] = useState(backlog?.description);
  // const [type, setType] = useState(backlog?.type);
  // const [assignee, setAssignee] = useState(backlog?.assignee_id);
  // const [reporter, setReporter] = useState(backlog?.reporter_id);
  // const [priority, setPriority] = useState(backlog?.priority);
  // const [sprint, setSprint] = useState(backlog?.sprint_id);
  // const [points, setPoints] = useState(backlog?.points);

  // useEffect(() => {
  //   setSummary(backlog?.summary)
  //   setDescription(backlog?.description);
  //   setAssignee(backlog?.assignee_id);
  //   setType(backlog?.type);
  //   setReporter(backlog?.reporter_id);
  //   setPriority(backlog?.priority);
  //   setSprint(backlog?.sprint_id);
  //   setPoints(backlog?.points);
  // }, [backlog]);

  // const handleSummaryChange = (e: any) => {
  //   setSummary(e.target.value);
  // };

  // const handleDescriptionChange = (e: any) => {
  //   setDescription(e.target.value);
  // };

  // const handleAssigneeChange = (assigneeId: number | undefined) => {
  //   setAssignee(assigneeId);
  // };

  // const handleReporterChange = (reporterId: number) => {
  //   setAssignee(reporterId);
  // };

  // const handleTypeChange = (typeId: 'story' | 'task' | 'bug') => {
  //   setType(typeId);
  // };

  // const handlePriorityChange = (priorityId: 'very_high' | 'high' | 'medium' | 'low' | 'very_low' | undefined) => {
  //   setPriority(priorityId);
  // };

  // const handleSprintChange = (sprintId: number | undefined) => {
  //   setSprint(sprintId);
  // }

  // const handlePointsChange = (p: number) => {
  //   setPoints(p);
  // }

  const handleSelectFieldsUpdate = (updatedField: { name: string, value: string | number | undefined }) => {
    if ('summary' in updatedField || 'description' in updatedField || 'points' in updatedField) {
      return;
    }

    console.log(updatedField);
  };

  const handleSummaryFieldUpdate = () => {
    const updatedSummary = form.getFieldValue('summary');
    if (!updatedSummary) {
      return;
    }
    const payload = {
      summary: updatedSummary,
    }
    console.log(payload);
  };

  const handleDescriptionFieldUpdate = () => {
    const updatedDesciption = form.getFieldValue('description');
    const payload = {
      description: updatedDesciption || undefined,
    }
    console.log(payload);
  };

  const handlePointsFieldUpdate = () => {
    const updatedPoints = form.getFieldValue('points');
    const payload = {
      points: updatedPoints || undefined,
    }
    console.log(payload);
  };

  if (!backlog) {
    return <h1>Unable to get backlog. Please try again.</h1>;
  }

  return (
    <Form form={form} initialValues={backlog} onValuesChange={handleSelectFieldsUpdate}>
      <div className="backlog-data-container">
        <div className="backlog-input-container">
          <Form.Item name="summary" rules={[{ required: true }]}>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <BacklogSummaryInput onBlur={handleSummaryFieldUpdate} />
          </Form.Item>
          <div className="backlog-description-container">
            <p>Description:</p>
            <Form.Item name="description">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <BacklogTextArea onBlur={handleDescriptionFieldUpdate} autoSize={{ minRows: 1, maxRows: 11 }} />
            </Form.Item>
          </div>
        </div>
        <div className="backlog-panel-container">
          <div>
            <span>Assignee</span>
            <Form.Item name="assignee_id">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <BacklogUserSelect options={USERS} allowClear />
            </Form.Item>
          </div>
          <div>
            <span>Type</span>
            <Form.Item name="type" rules={[{ required: true }]}>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <BacklogSelect options={TYPES} />
            </Form.Item>
          </div>
          <div>
            <span>Priority</span>
            <Form.Item name="priority">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <BacklogSelect options={PRIORITIES} allowClear />
            </Form.Item>
          </div>
          <div>
            <span>Sprint</span>
            <Form.Item name="sprint_id">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <BacklogSelect options={SPRINTS} allowClear />
            </Form.Item>
          </div>
          <div>
            <span>Point(s)</span>
            <Form.Item name="points">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <BacklogInputNumber onBlur={handlePointsFieldUpdate} />
            </Form.Item>
          </div>
          <div>
            <span>Reporter</span>
            <Form.Item name="reporter_id" rules={[{ required: true }]}>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <BacklogUserSelect options={USERS} />
            </Form.Item>
          </div>
        </div>
      </div>
    </Form>
  );
}

export default Backlog;
