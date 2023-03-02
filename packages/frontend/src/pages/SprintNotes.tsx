import React, { useRef } from 'react';
import { Button, message, Space, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { LexicalEditor } from 'lexical';
import { useGetSprintNotesQuery, useUpdateSprintMutation } from '../api/sprint';
import Editor from '../components/editor/Editor';
import Container from '../components/layouts/Container';
import './SprintNotes.css';

export default function SprintNotes() {
  const params = useParams();
  const { Title } = Typography;

  // Ref to current editor instance
  const editorRef = useRef<LexicalEditor>(null);

  const sprintId = Number(params.sprintId);

  const { data: notesData } = useGetSprintNotesQuery(Number(params.sprintId));
  const [updateSprint] = useUpdateSprintMutation();

  const handleSave = async () => {
    if (editorRef.current) {
      const serialisedState = JSON.stringify(editorRef.current.getEditorState());
      const payload = {
        sprintId,
        notes: serialisedState,
      };

      try {
        await updateSprint(payload).unwrap();
        message.success('Notes saved');
      } catch (err) {
        message.error('Failed to save notes');
        console.error(err);
      }
    }
  };

  return (
    <Container>
      <Title level={3}>Notes</Title>
      <div className="sprint-notes-editor">
        <Editor initialStateString={notesData?.notes} ref={editorRef} />
        <div className="sprint-notes-button">
          <Button onClick={handleSave} type="primary">
            Save
          </Button>
        </div>
      </div>
    </Container>
  );
}
