import React, { useMemo, useRef, useState } from 'react';
import { Button, Form, Input, Modal, Select, message, Typography, Space, Row, Col } from 'antd';
import { useCreateBacklogMutation, useCreateIssueMutation, useUpdateIssueMutation } from '../../api/issue';
import { getErrorMessage } from '../../helpers/error';
import { BacklogFromIssuePayload, BacklogPriority, Issue, IssueStatus } from '../../api/types';
import { useProject } from '../../api/hooks';
import { Link, useParams } from 'react-router-dom';
import { UserAvatar } from '../avatar/UserAvatar';
import Editor from '../editor/Editor';
import { LexicalEditor, $getRoot } from 'lexical';
import { BACKLOG_PRIORITY_OPTIONS } from '../../helpers/constants';
import { useGetUserInfoQuery } from '../../api/auth';
import { transformToLabel } from '../tables/IssuesTable';
import IssueComment from '../fields/IssueComment';
import { useGetIssueCommentsQuery } from '../../api/comment';
import Comment from '../lists/Comment';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface IssueModalProps {
  defaultIssue?: Issue;
  readOnly?: boolean; //toggle read only mode
}

// Case 1: Issue creation, empty defaultIssue, no readOnly field
// Case 2: Issue view/update, defaultIssue is provided, readOnly field used
const IssueModal: React.FC<IssueModalProps> = ({ defaultIssue, readOnly }) => {
  const params = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { project, assignedProjects } = useProject(Number(params.projectId || -1));
  // Ref to current editor instance
  const editorRef = useRef<LexicalEditor>(null);
  const { data: userInfo } = useGetUserInfoQuery();

  const [createIssue] = useCreateIssueMutation();
  const [updateIssue] = useUpdateIssueMutation();
  const [createBacklog] = useCreateBacklogMutation();
  const { data: comments } = useGetIssueCommentsQuery({ issueId: defaultIssue?.id || -1 });

  const showModal = () => {
    setIsModalVisible(true);

    if (defaultIssue) {
      form.setFieldsValue({
        title: defaultIssue.title,
        assigneeProjectId: defaultIssue.assignee_project_id,
        priority: defaultIssue.priority,
        reporterId: defaultIssue.reporter_id,
        status: defaultIssue.status,
        status_explanation: defaultIssue.status_explanation,
      });
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();

      values.description = JSON.stringify(editorRef.current?.getEditorState());
      values.assignerProjectId = Number(params.projectId);

      await createIssue(values).unwrap();
      message.success('Issue created successfully!');

      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const handleUpdate = async () => {
    if (!defaultIssue) {
      return;
    }
    try {
      const values: Partial<Issue> = await form.validateFields();
      values.description = JSON.stringify(editorRef.current?.getEditorState());

      await updateIssue({ issueId: defaultIssue?.id, fieldToUpdate: values }).unwrap();
      message.success('Issue updated');
      setIsModalVisible(false);
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const handleCreateBacklog = (issue: Issue) => async () => {
    if (!userInfo) {
      message.error('User info not found');
      return;
    }

    const parsedEditorState = editorRef.current?.parseEditorState(issue.description || '');
    const descriptionPlaintext = parsedEditorState?.read(() => $getRoot().getTextContent());

    const backlogPayload: BacklogFromIssuePayload = {
      issueId: issue.id,
      summary: issue.title,
      priority: issue.priority || null,
      reporterId: userInfo.userId,
      description: descriptionPlaintext || null,
      projectId: issue.assignee_project_id,
    };

    try {
      await createBacklog(backlogPayload).unwrap();
      message.success('Backlog created');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {defaultIssue ? 'View' : 'Create Issue'}
      </Button>
      <Modal
        title={defaultIssue ? 'View Issue' : 'Create New Issue'}
        open={isModalVisible}
        onOk={!defaultIssue ? handleCreate : undefined}
        onCancel={handleCancel}
        okText={!defaultIssue ? 'Create' : ''}
        footer={!defaultIssue ? undefined : null} //Disable footer in view mode
        width={900}
      >
        <Form form={form} layout="vertical" name="issueForm">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please input the issue title!' }]}>
            {readOnly ? <Text>{defaultIssue?.title || '-'}</Text> : <Input placeholder="Enter issue title here..." />}
          </Form.Item>

          {!readOnly && (
            <Form.Item
              name="assigneeProjectId"
              label="Project"
              rules={[{ required: true, message: 'Please select a project!' }]}
            >
              <Select placeholder="Select a project" allowClear>
                {assignedProjects?.map(({ id, targetProject }) => (
                  <Select.Option key={id} value={targetProject.id}>
                    {targetProject.pname}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {defaultIssue && (
            <>
              <Form.Item name="status" label="Status">
                {readOnly ? (
                  <Select
                    options={Object.values(IssueStatus).map((status) => ({
                      label: transformToLabel(status),
                      value: status,
                    }))}
                    style={{ width: '50%' }}
                  />
                ) : (
                  <Text>{defaultIssue?.status ? transformToLabel(defaultIssue?.status) : '-'}</Text>
                )}
              </Form.Item>

              <Form.Item name="status_explanation" label="Status Explanation">
                {readOnly ? (
                  <TextArea placeholder="Enter status explanation here..." autoSize={{ minRows: 3 }} />
                ) : (
                  <Text>{defaultIssue?.status_explanation || '-'}</Text>
                )}
              </Form.Item>
            </>
          )}

          <Form.Item name="priority" label="Priority">
            {readOnly ? (
              <Text>
                {BACKLOG_PRIORITY_OPTIONS.find(({ value }) => value === defaultIssue?.priority)?.label || '-'}
              </Text>
            ) : (
              <Select placeholder="Select a priority" allowClear>
                {BACKLOG_PRIORITY_OPTIONS.map(({ value, label }) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item
            name="reporterId"
            label="Reporter"
            rules={[{ required: true, message: 'Please select a reporter!' }]}
          >
            {readOnly ? (
              defaultIssue?.reporter?.user ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserAvatar
                    className="user-select-avatar"
                    userDisplayName={defaultIssue?.reporter.user.user_display_name}
                    userHashString={defaultIssue?.reporter.user.user_email}
                  />
                  <Text>{defaultIssue?.reporter.user.user_display_name}</Text>
                </div>
              ) : (
                <Text>-</Text>
              )
            ) : (
              <Select placeholder="Select a reporter" allowClear>
                {project?.users?.map(({ user }) => (
                  <Select.Option key={user.user_id} value={user.user_id}>
                    <UserAvatar
                      className="user-select-avatar"
                      userDisplayName={user.user_display_name}
                      userHashString={user.user_email}
                    />
                    <span className="user-select-username-text">{user.user_display_name}</span>
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item name="description" label="Detailed Description">
            <Editor
              initialStateString={defaultIssue?.description ?? ''}
              ref={editorRef}
              isEditable={!readOnly}
              hideToolbar={readOnly}
            />
          </Form.Item>

          {defaultIssue && (
            <Row justify={'space-between'}>
              <Col>
                {readOnly && (
                  <Space size="small" direction="vertical">
                    <Button
                      type="primary"
                      onClick={handleCreateBacklog(defaultIssue)}
                      disabled={defaultIssue.backlog?.backlog_id !== undefined}
                    >
                      Create backlog
                    </Button>
                    {defaultIssue.backlog?.backlog_id !== undefined && (
                      <Link
                        to={`/project/${defaultIssue.assignee_project_id}/backlog/${defaultIssue.backlog.backlog_id}`}
                      >
                        Goto backlog
                      </Link>
                    )}
                  </Space>
                )}
              </Col>
              <Col>
                <Space size="small">
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" onClick={handleUpdate}>
                    Update
                  </Button>
                </Space>
              </Col>
            </Row>
          )}
        </Form>

        {defaultIssue && (
          <div style={{ margin: '40px 20px' }}>
            <Title level={4}>Comments</Title>
            <IssueComment issueId={defaultIssue.id} />
            <Comment comments={comments} />
          </div>
        )}
      </Modal>
    </>
  );
};

export default IssueModal;
