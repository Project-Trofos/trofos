import React, { useRef } from 'react';
import { message, Modal } from 'antd';
import { LexicalEditor } from 'lexical';
import { useGetSprintNotesQuery, useUpdateSprintMutation } from '../../api/sprint';
import Editor from '../editor/Editor';

export default function SprintNotesModal(props: SprintNotesModalProps) {
  const { isOpen, setIsOpen, sprintId } = props;

  // Ref to current editor instance
  const editorRef = useRef<LexicalEditor>(null);

  const { data: notesData } = useGetSprintNotesQuery(Number(sprintId));
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

  const handleOnCancel = () => {
    setIsOpen(false);
  };

  return (
    <Modal width={800} title="Notes" open={isOpen} onOk={handleSave} onCancel={handleOnCancel} okText="Save">
      <div className="sprint-notes-editor">
        <Editor initialStateString={notesData?.notes} ref={editorRef} maxLength={2500} />
      </div>
    </Modal>
  );
}

type SprintNotesModalProps = {
  isOpen: boolean;
  setIsOpen(state: boolean): void;
  sprintId: number;
};
