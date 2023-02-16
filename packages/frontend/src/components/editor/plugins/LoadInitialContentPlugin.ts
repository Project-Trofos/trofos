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
      // Use the native DOMParser API (available in browser) to parse the HTML string.
      const parser = new DOMParser();
      const dom = parser.parseFromString(html ?? '', 'text/html');

      const nodes = $generateNodesFromDOM(editor, dom);

      $getRoot().clear();

      // Select the root
      $getRoot().select();

      // Insert nodes at that root selection.
      $insertNodes(nodes);
    });
    // Only update if html changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  return null;
}
