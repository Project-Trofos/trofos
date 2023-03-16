/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * https://github.com/facebook/lexical/blob/0.8.1/packages/lexical-playground/src/plugins/MaxLengthPlugin/index.tsx
 */

import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { trimTextContentFromAnchor } from '@lexical/selection';
import { Typography } from 'antd';
import { $getRoot, $getSelection, $isRangeSelection, RootNode } from 'lexical';

import './MaxLengthPlugin.css';

export function MaxLengthPlugin({ maxLength }: { maxLength: number }) {
  const [editor] = useLexicalComposerContext();
  const [lengthLeft, setLengthLeft] = useState(0);

  // Set the length left
  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // ! getTextContentSize does not seem to provide accurate character count
        setLengthLeft(maxLength - $getRoot().getTextContentSize());
      });
    });
  }, [editor, maxLength]);

  useEffect(() => {
    // let lastRestoredEditorState: EditorState | null = null;

    return editor.registerNodeTransform(RootNode, (rootNode: RootNode) => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return;
      }
      const prevEditorState = editor.getEditorState();
      const prevTextContentSize = prevEditorState.read(() => rootNode.getTextContentSize());
      const textContentSize = rootNode.getTextContentSize();
      if (prevTextContentSize !== textContentSize) {
        const delCount = textContentSize - maxLength;
        const { anchor } = selection;

        if (delCount > 0) {
          // Restore the old editor state instead if the last
          // text content was already at the limit.
          // if (prevTextContentSize === maxLength && lastRestoredEditorState !== prevEditorState) {
          //   lastRestoredEditorState = prevEditorState;
          //   $restoreEditorState(editor, prevEditorState);
          // } else {
          // ! Original implementation seems to have some bug, leaving it as this for now.
          // ! https://github.com/facebook/lexical/issues/4075
          trimTextContentFromAnchor(editor, anchor, delCount);
          // }
        }
      }
    });
  }, [editor, maxLength]);

  if (lengthLeft > 0) {
    return null;
  }

  return <Typography.Text className="editor-char-limit-text">Character limit reached!</Typography.Text>;
}
