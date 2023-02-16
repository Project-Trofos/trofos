import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $insertNodes } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import React from 'react';

type InitialContentProps = {
  html?: string;
};

export default function LoadInitialContentPlugin({ html }: InitialContentProps) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    editor.update(() => {
      if (html) {
        const savedState = editor.parseEditorState(html);
        editor.setEditorState(savedState);
      } else {
        $getRoot().clear();
      }
    });
    // Only update if html changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  return null;
}
