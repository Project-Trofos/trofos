import React, { useCallback, useRef, useState } from 'react';
import {$getRoot, $createParagraphNode, $createTextNode, LexicalEditor} from 'lexical';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
//import * as Y from 'yjs';
import type { Doc } from 'yjs';
// @ts-ignore
import {WebsocketProvider} from 'y-websocket';
import type {Provider} from '@lexical/yjs';

import {createWebsocketProvider, getDocFromMap} from './providers';
import theme from '../../editor/themes/Theme';
import '../../editor/themes/Theme.css';
import { useGetUserInfoQuery } from '../../../api/auth';
import { get } from 'lodash';
import Editor from '../../editor/Editor';

export default function ScrumBoardNotesTab(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const editorRef = useRef<LexicalEditor>(null);

  const initialConfig = {
    // NOTE: This is critical for collaboration plugin to set editor state to null. It
    // would indicate that the editor should not try to set any default state
    // (not even empty one), and let collaboration plugin do it instead
    editorState: null,
    namespace: 'Demo',
    nodes: [],
    onError: (error: Error) => {
      throw error;
    },
    theme: theme,
  };

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Doc>) => {
      const doc = getDocFromMap(id, yjsDocMap);

      return createWebsocketProvider(id, doc);
    }, [],
  );
  
  const getCollaborationPlugin = () => {
    return (
      <CollaborationPlugin
        id="Demo"
        providerFactory={providerFactory}
        shouldBootstrap={false}
        username={userInfo?.userDisplayName ?? 'Anonymous'}
        cursorColor='#7d0000'
        cursorsContainerRef={containerRef}
      />
    )
  }

  return (
    <div className="scrum-board-notes-tab">
      <Editor
        collaborationPlugin={getCollaborationPlugin()}
        ref={editorRef}
      />
    </div>
  );
}