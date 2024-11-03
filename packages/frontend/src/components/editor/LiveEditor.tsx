import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useGetUserInfoQuery } from '../../api/auth';
import { Avatar, Layout, Space, Tooltip } from 'antd';

const { Content } = Layout;

export default function Editor({ sprintId }: { sprintId: string }) {
  const { data: userInfo } = useGetUserInfoQuery();
  const [activeUsers, setActiveUsers] = useState<Set<{ name: string, color: string }>>(new Set());
  const activeUsersRef = useRef<Set<{ name: string, color: string }>>(new Set());

  const providerFactory = useCallback((
    id: string,
    yjsDocMap: Map<string, Y.Doc>
  ): Provider => {
    const doc = new Y.Doc();
    yjsDocMap.set(id, doc);
  
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const provider = new HocuspocusProvider({
      websocketProvider: socket,
      name: `${id}`,
      document: doc,
      onSynced: () => {
        console.log("synced");
      },
      onAwarenessUpdate: ({ states }) => {
        // set active users
        const updatedActiveUsers = new Set<{ name: string, color: string }>();
        console.log(states);
        states.forEach((state) => {
          if (!state.name) {
            return;
          }
          updatedActiveUsers.add({
            name: state?.name,
            color: state?.color,
          });
        });
        activeUsersRef.current = updatedActiveUsers;
      }
    });
    // @ts-ignore
    return provider;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Only update if there is a change in activeUsersRef
      if (activeUsersRef.current !== activeUsers) {
        setActiveUsers(new Set(activeUsersRef.current));
      }
    }, 500);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [activeUsers]);

  return (
    <Content style={{ overflowX: 'auto' }}>
      <Space style={{ paddingBottom: '5px' }}>
        {Array.from(activeUsers).map((userInfo) => {
          if (!userInfo || !userInfo.name) return null;
          return (
            <Tooltip key={userInfo.name} title={userInfo.name}>
              <Avatar style={{ backgroundColor: userInfo.color }}>
                {userInfo.name[0].toUpperCase()}
              </Avatar>
            </Tooltip>
          );
        })}
      </Space>
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
            providerFactory={providerFactory}
            shouldBootstrap={false}
            username={userInfo?.userDisplayName}
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
    </Content>
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
