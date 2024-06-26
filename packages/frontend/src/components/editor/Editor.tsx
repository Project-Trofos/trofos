import React from 'react';
import clsx from 'clsx';

import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { LexicalEditor } from 'lexical';

// Nodes
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';

// For markdown
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';

import theme from './themes/Theme';
import './themes/Theme.css';

import ToolbarPlugin from './plugins/ToolbarPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import PlaygroundAutoLinkPlugin from './plugins/AutoLinkPlugin';
import LexicalEditorRefPlugin from './plugins/LexicalEditorRefPlugin';
import LoadInitialContentPlugin from './plugins/LoadInitialContentPlugin';
import LinkPlugin from './plugins/LinkPlugin';

import './Editor.css';
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin';

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  console.error(error);
}

const baseInitialConfig: InitialConfigType = {
  editable: true,
  namespace: 'MyEditor',
  theme,
  onError,
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

type EditorProps = {
  // Serialised editor state
  initialStateString?: string;
  isEditable?: boolean;
  hideToolbar?: boolean;
  maxLength?: number;
};

const Editor = React.forwardRef<LexicalEditor, EditorProps>((props, ref) => {
  const { initialStateString, isEditable = true, hideToolbar = false, maxLength } = props;

  const initialConfig: InitialConfigType = {
    ...baseInitialConfig,
    editable: isEditable,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={clsx({ 'editor-container': !hideToolbar })}>
        {!hideToolbar && <ToolbarPlugin />}
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={clsx('editor-editable-container', { 'editor-editable-container-editor-view': !hideToolbar })}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <TablePlugin />
        <TabIndentationPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <PlaygroundAutoLinkPlugin />
        <CodeHighlightPlugin />
        <ListPlugin />
        <LinkPlugin />
        <CheckListPlugin />
        <LexicalEditorRefPlugin ref={ref} />
        <LoadInitialContentPlugin editorStateString={initialStateString} />
        {maxLength && isEditable && <MaxLengthPlugin maxLength={maxLength} />}
      </div>
    </LexicalComposer>
  );
});

export default Editor;
