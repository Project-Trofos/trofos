import React, { useRef, useState } from 'react';
import { Button, Select, Space } from 'antd';
import { LexicalEditor } from 'lexical';
import { useParams } from 'react-router-dom';
import { $generateHtmlFromNodes } from '@lexical/html';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useProject } from '../api/hooks';

import Container from '../components/layouts/Container';
import Editor from '../components/editor/Editor';
import { useFeedback } from '../api/hooks/feedbackHooks';
import { useGetSprintsByProjectIdQuery } from '../api/sprint';
import { useGetUserInfoQuery } from '../api/auth';
import conditionalRender from '../helpers/conditionalRender';
import confirm from '../components/modals/confirm';

export default function ProjectFeedbacks(): JSX.Element {
  const params = useParams();
  const { project } = useProject(Number(params.projectId) ? Number(params.projectId) : -1);
  const { data: sprints } = useGetSprintsByProjectIdQuery(project?.id ?? skipToken);
  const { data: userInfo } = useGetUserInfoQuery();

  const [selectedSprintId, setSelectedSprintId] = useState<number | undefined>();

  return (
    <Container>
      <Select
        placeholder="Select a sprint to show feedback"
        style={{ width: '100%' }}
        options={sprints?.sprints.map((s) => ({ value: s.id, label: s.name }))}
        onSelect={(v) => setSelectedSprintId(v)}
      />
      {/* Render Editor for faculty, editor display for students */}
      {selectedSprintId &&
        conditionalRender(
          <FacultyView sprintId={selectedSprintId} />,
          userInfo?.userRoleActions ?? [],
          ['create_course'],
          <StudentView sprintId={selectedSprintId} />,
        )}
    </Container>
  );
}

function FacultyView(props: { sprintId?: number }) {
  const { sprintId } = props;
  const { getFeedbackBySprintId, handleCreateFeedback, handleUpdateFeedback, handleDeleteFeedback } = useFeedback();
  const currentFeedback = getFeedbackBySprintId(sprintId ?? -1);

  const [viewState, setViewState] = useState<'view' | 'edit'>('view');

  // Ref to current editor instance
  const editorRef = useRef<LexicalEditor>(null);

  const handleSave = () => {
    if (editorRef.current) {
      editorRef.current.update(async () => {
        if (editorRef.current && sprintId) {
          if (currentFeedback) {
            await handleUpdateFeedback(currentFeedback.id, $generateHtmlFromNodes(editorRef.current));
          } else {
            await handleCreateFeedback(sprintId, $generateHtmlFromNodes(editorRef.current));
          }
        }
      });
    }
    setViewState('view');
  };

  return (
    <>
      {viewState === 'view' && currentFeedback && (
        <Editor initialHtml={currentFeedback?.content} ref={editorRef} hideToolbar isEditable={false} />
      )}
      {viewState === 'edit' && <Editor initialHtml={currentFeedback?.content} ref={editorRef} />}

      <Space style={{ display: 'flex', justifyContent: 'center' }}>
        {viewState === 'view' && (
          <Button type="primary" onClick={() => setViewState('edit')}>
            {currentFeedback ? 'Edit' : 'Create'}
          </Button>
        )}
        {viewState === 'edit' && (
          <Button onClick={handleSave} type="primary">
            Save
          </Button>
        )}
        {viewState === 'edit' && <Button onClick={() => setViewState('view')}>Cancel</Button>}
        {currentFeedback && (
          <Button
            onClick={() => confirm('Are you sure you want to delete?', () => handleDeleteFeedback(currentFeedback.id))}
            danger
          >
            Delete feedback
          </Button>
        )}
      </Space>
    </>
  );
}

function StudentView(props: { sprintId?: number }) {
  const { sprintId } = props;

  const { getFeedbackBySprintId } = useFeedback();
  const currentFeedback = getFeedbackBySprintId(sprintId ?? -1);

  return currentFeedback ? (
    <Editor initialHtml={currentFeedback.content} isEditable={false} hideToolbar />
  ) : (
    <p>No feedback for this sprint yet...</p>
  );
}
