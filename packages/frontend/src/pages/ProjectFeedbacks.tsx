import React, { useEffect, useRef, useState } from 'react';
import { Button, Select, Space } from 'antd';
import { LexicalEditor } from 'lexical';
import { useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useProject } from '../api/hooks';

import Container from '../components/layouts/Container';
import Editor from '../components/editor/Editor';
import { useFeedback } from '../api/hooks/feedbackHooks';
import { useGetSprintsByProjectIdQuery } from '../api/sprint';
import { useGetUserInfoQuery } from '../api/auth';
import conditionalRender from '../helpers/conditionalRender';
import confirm from '../components/modals/confirm';
import Timestamp from '../components/common/Timestamp';
import AvatarWithName from '../components/avatar/AvatarWithName';

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
          ['create_course', 'admin'],
          <StudentView sprintId={selectedSprintId} />,
        )}
    </Container>
  );
}

/**
 * Contains edit and view functionalities.
 */
function FacultyView(props: { sprintId?: number }) {
  const { sprintId } = props;
  const { getFeedbackBySprintId, handleCreateFeedback, handleUpdateFeedback, handleDeleteFeedback } = useFeedback();
  const currentFeedback = getFeedbackBySprintId(sprintId ?? -1);

  const [viewState, setViewState] = useState<'view' | 'edit'>('view');

  // Ref to current editor instance
  const editorRef = useRef<LexicalEditor>(null);

  const handleSave = () => {
    if (editorRef.current) {
      // We can only get editor state in an update callback
      editorRef.current.update(async () => {
        if (editorRef.current && sprintId) {
          const serialisedState = JSON.stringify(editorRef.current.getEditorState());
          if (currentFeedback) {
            await handleUpdateFeedback(currentFeedback.id, serialisedState);
          } else {
            await handleCreateFeedback(sprintId, serialisedState);
          }
        }
      });
    }
    setViewState('view');
  };

  // Go back to view state once sprint ID changed
  useEffect(() => {
    setViewState('view');
  }, [sprintId]);

  return (
    <>
      {currentFeedback && (
        <Space>
          <AvatarWithName
            icon={currentFeedback.user.user_display_name[0]}
            username={currentFeedback.user.user_display_name}
          />
          <Timestamp createdAt={currentFeedback.created_at} updatedAt={currentFeedback.updated_at} />
        </Space>
      )}
      {viewState === 'view' && currentFeedback && (
        <Editor initialStateString={currentFeedback?.content} ref={editorRef} hideToolbar isEditable={false} />
      )}
      {viewState === 'edit' && <Editor initialStateString={currentFeedback?.content} ref={editorRef} />}

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
            onClick={() =>
              confirm('Are you sure you want to delete?', async () => {
                await handleDeleteFeedback(currentFeedback.id);
                setViewState('view');
              })
            }
            danger
          >
            Delete feedback
          </Button>
        )}
      </Space>
    </>
  );
}

/**
 * Contains a read-only editor.
 */
function StudentView(props: { sprintId?: number }) {
  const { sprintId } = props;

  const { getFeedbackBySprintId } = useFeedback();
  const currentFeedback = getFeedbackBySprintId(sprintId ?? -1);

  return currentFeedback ? (
    <>
      <Space>
        <AvatarWithName
          icon={currentFeedback.user.user_display_name[0]}
          username={currentFeedback.user.user_display_name}
        />
        <Timestamp createdAt={currentFeedback.created_at} updatedAt={currentFeedback.updated_at} />
      </Space>
      <Editor initialStateString={currentFeedback.content} isEditable={false} hideToolbar />
    </>
  ) : (
    <p>No feedback for this sprint yet...</p>
  );
}
