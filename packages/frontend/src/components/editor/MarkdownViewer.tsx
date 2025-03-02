import React, { useEffect } from 'react';
import { createEditor, EditorState } from 'lexical';
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

// Import built-in nodes for markdown rendering
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';

const MarkdownViewer = ({ markdown }: { markdown: string }) => {
  const config = {
    editorState: () => $convertFromMarkdownString(markdown, TRANSFORMERS),
    editable: false,
    namespace: 'MarkdownViewer',
    onError: (err: Error) => console.error(err),
    nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode],
  };

  return (
    <LexicalComposer initialConfig={config}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </LexicalComposer>
  );
};

export default MarkdownViewer;
