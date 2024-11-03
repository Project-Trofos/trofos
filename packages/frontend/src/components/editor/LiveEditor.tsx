import React from 'react';
import clsx from 'clsx';

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import * as Y from "yjs";
import { type Provider } from "@lexical/yjs";
import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";

import theme from './themes/Theme';
import './themes/Theme.css';

// Nodes
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';

// For markdown
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';

import ToolbarPlugin from './plugins/ToolbarPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import PlaygroundAutoLinkPlugin from './plugins/AutoLinkPlugin';
import LinkPlugin from './plugins/LinkPlugin';

import './Editor.css';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';

export default function Editor({ sprintId }: { sprintId: string }) {
  return (
    <LexicalComposer
      initialConfig={{
        editorState: null,
        namespace: "liveEditor",
        onError: (error: Error) => console.log(error),
        theme,
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
      }}
    >
      <div className={clsx({ 'editor-container': true })}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={clsx('editor-editable-container', { 'editor-editable-container-editor-view': true })}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <CollaborationPlugin
          id={sprintId}
          providerFactory={createWebsocketProvider}
          shouldBootstrap={false}
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
      </div>
    </LexicalComposer>
  );
}

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

const socket = new HocuspocusProviderWebsocket({
  url: `${protocol}//${window.location.host}/api/ws/collaboration`,
  connect: false,
});

function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Y.Doc>
): Provider {
  const doc = new Y.Doc();
  yjsDocMap.set(id, doc);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new HocuspocusProvider({
    websocketProvider: socket,
    name: `${id}`,
    document: doc,
    onSynced: () => {
      console.log("synced");
    },
  });
}
