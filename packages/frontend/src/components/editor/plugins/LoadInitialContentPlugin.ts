import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import React from 'react';

type InitialContentProps = {
  editorStateString?: string;
};

/**
 * Load initial state into the editor using a serialised editor state string.
 */
export default function LoadInitialContentPlugin({ editorStateString }: InitialContentProps) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    editor.update(() => {
      if (editorStateString) {
        const savedState = editor.parseEditorState(editorStateString);
        editor.setEditorState(savedState);
      } else {
        $getRoot().clear();
      }
    });
    // Only update if editorStateString changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorStateString]);

  return null;
}
