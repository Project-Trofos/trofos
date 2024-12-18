import React, { useRef, useState } from 'react';
import { Button, Collapse, Empty, Space } from 'antd';
import { LexicalEditor } from 'lexical';
import { useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useProject } from '../../api/hooks';
import Editor from '../../components/editor/Editor';
import { useGetSprintsByProjectIdQuery } from '../../api/sprint';
import conditionalRender from '../../helpers/conditionalRender';
import confirm from '../../components/modals/confirm';
import Timestamp from '../../components/common/Timestamp';
import AvatarWithName from '../../components/avatar/AvatarWithName';
import { useFeedbackBySprint as useFeedbackBySprintId } from '../../api/hooks/feedbackHooks';
import { Feedback } from '../../api/types';

import './ProjectFeedbacks.css';
import { useProjectActions } from '../../api/hooks/roleHooks';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';

const { Panel } = Collapse;

export default function ProjectFeedbacks(): JSX.Element {
  const params = useParams();
  const { project } = useProject(Number(params.projectId) ? Number(params.projectId) : -1);
  const { data: sprints } = useGetSprintsByProjectIdQuery(project?.id ?? skipToken);

  const { actions: projectActions } = useProjectActions({ projectId: project?.id });

  return (
    <GenericBoxWithBackground>
      {project && sprints?.sprints && sprints.sprints.length > 0 ? (
        <Collapse>
          {sprints?.sprints?.map((s) => {
            return (
              <Panel header={s.name} key={s.id}>
                {/* Render Editor for faculty, editor display for students */}
                {conditionalRender(
                  <FacultyView projectId={project.id} sprintId={s.id} />,
                  projectActions,
                  ['create_feedback', 'update_feedback', 'delete_feedback', 'admin'],
                  <StudentView projectId={project.id} sprintId={s.id} />,
                )}
              </Panel>
            );
          })}
        </Collapse>
      ) : (
        <Empty description="No sprint has been created." />
      )}
    </GenericBoxWithBackground>
  );
}

/**
 * Contains edit and view functionalities.
 */
function FacultyView(props: { sprintId: number; projectId: number }) {
  const { sprintId, projectId } = props;

  const { feedbacks, handleCreateFeedback, handleDeleteFeedback, handleUpdateFeedback } = useFeedbackBySprintId(
    projectId,
    sprintId,
  );

  return (
    <div className="feedbacks-container">
      {/* Existing feedbacks */}
      {feedbacks?.map((f) => {
        return (
          <FeedbackEditor
            key={f.id}
            handleCreateFeedback={handleCreateFeedback}
            handleDeleteFeedback={handleDeleteFeedback}
            handleUpdateFeedback={handleUpdateFeedback}
            feedback={f}
          />
        );
      })}

      {/* For create new feedback */}
      <FeedbackEditor
        handleCreateFeedback={handleCreateFeedback}
        handleDeleteFeedback={handleDeleteFeedback}
        handleUpdateFeedback={handleUpdateFeedback}
        feedback={undefined}
      />
    </div>
  );
}

function FeedbackEditor(props: {
  feedback?: Feedback;
  handleCreateFeedback: (state: string) => Promise<void>;
  handleUpdateFeedback: (id: number, state: string) => Promise<void>;
  handleDeleteFeedback: (id: number) => Promise<void>;
}) {
  const { feedback, handleCreateFeedback, handleDeleteFeedback, handleUpdateFeedback } = props;
  const [viewState, setViewState] = useState<'view' | 'edit'>('view');

  // Ref to current editor instance
  const editorRef = useRef<LexicalEditor>(null);

  const handleSave = async () => {
    if (editorRef.current) {
      const serialisedState = JSON.stringify(editorRef.current.getEditorState());
      if (feedback) {
        await handleUpdateFeedback(feedback.id, serialisedState);
      } else {
        await handleCreateFeedback(serialisedState);
      }
      setViewState('view');
    }
  };

  return (
    <div className="feedback-editor">
      {feedback && (
        <Space className="feedback-user-container">
          <AvatarWithName icon={feedback.user.user_display_name[0]} username={feedback.user.user_display_name} />
          <Timestamp createdAt={feedback.created_at} updatedAt={feedback.updated_at} />
        </Space>
      )}
      {viewState === 'view' && feedback && (
        <Editor initialStateString={feedback?.content} ref={editorRef} hideToolbar isEditable={false} />
      )}
      {viewState === 'edit' && <Editor initialStateString={feedback?.content} ref={editorRef} maxLength={2500} />}

      <Space className="feedback-button-group">
        {viewState === 'view' && (
          <Button type="primary" onClick={() => setViewState('edit')}>
            {feedback ? 'Edit' : 'New'}
          </Button>
        )}
        {viewState === 'edit' && (
          <Button onClick={handleSave} type="primary">
            Save
          </Button>
        )}
        {viewState === 'edit' && <Button onClick={() => setViewState('view')}>Cancel</Button>}
        {feedback && (
          <Button
            onClick={() =>
              confirm('Are you sure you want to delete?', async () => {
                await handleDeleteFeedback(feedback.id);
                setViewState('view');
              })
            }
            danger
          >
            Delete
          </Button>
        )}
      </Space>
    </div>
  );
}

/**
 * Contains a read-only editor.
 */
function StudentView(props: { sprintId: number; projectId: number }) {
  const { sprintId, projectId } = props;

  const { feedbacks } = useFeedbackBySprintId(projectId, sprintId);

  return feedbacks && feedbacks.length > 0 ? (
    <div className="feedbacks-container">
      {feedbacks.map((feedback) => {
        return (
          <div key={feedback.id}>
            <Space>
              <AvatarWithName icon={feedback.user.user_display_name[0]} username={feedback.user.user_display_name} />
              <Timestamp createdAt={feedback.created_at} updatedAt={feedback.updated_at} />
            </Space>
            <Editor initialStateString={feedback.content} isEditable={false} hideToolbar />
          </div>
        );
      })}
    </div>
  ) : (
    <p>No feedback for this sprint yet...</p>
  );
}
