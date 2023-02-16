import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';

import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  CheckOutlined,
  FileMarkdownOutlined,
  ItalicOutlined,
  MoreOutlined,
  OrderedListOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';

import {
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { $createCodeNode, $isCodeNode } from '@lexical/code';
import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';
import { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { PLAYGROUND_TRANSFORMERS } from './MarkdownTransformersPlugin';

import './ToolbarPlugin.css';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));
    }
  }, []);

  // Toggle markdown
  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
        $convertFromMarkdownString(firstChild.getTextContent(), PLAYGROUND_TRANSFORMERS);
        document.getElementsByClassName('editor-editable-container')[0].classList.remove('container-no-padding');
      } else {
        const markdown = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
        root.clear().append($createCodeNode('markdown').append($createTextNode(markdown)));
        document.getElementsByClassName('editor-editable-container')[0].classList.add('container-no-padding');
      }
      root.selectEnd();
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, updateToolbar]);

  return (
    <div className="editor-toolbar-container">
      <BoldOutlined
        className={clsx({ 'editor-button-active': isBold })}
        title="Bold"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      />

      <ItalicOutlined
        className={clsx({ 'editor-button-active': isItalic })}
        title="Italic"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      />

      <UnderlineOutlined
        className={clsx({ 'editor-button-active': isUnderline })}
        title="Underline"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      />

      <StrikethroughOutlined
        className={clsx({ 'editor-button-active': isStrikethrough })}
        title="Strike through"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
      />

      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: '1',
              label: (
                <div role="button" tabIndex={-1} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}>
                  Code
                </div>
              ),
              className: clsx({ 'ant-dropdown-menu-item-active': isCode }),
            },
            {
              key: '2',
              label: (
                <div
                  role="button"
                  tabIndex={-1}
                  onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
                >
                  Superscript
                </div>
              ),
              className: clsx({ 'ant-dropdown-menu-item-active': isSuperscript }),
            },
            {
              key: '3',
              label: (
                <div
                  role="button"
                  tabIndex={-1}
                  onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
                >
                  Subscript
                </div>
              ),
              className: clsx({ 'ant-dropdown-menu-item-active': isSubscript }),
            },
          ],
        }}
      >
        <MoreOutlined />
      </Dropdown>

      <AlignLeftOutlined title="Align left" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} />

      <AlignCenterOutlined
        title="Align center"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
      />

      <AlignRightOutlined title="Align right" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} />

      <OrderedListOutlined
        title="Ordered list"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      />

      <UnorderedListOutlined
        title="Unordered list"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      />

      <CheckOutlined title="Check list" onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)} />

      <FileMarkdownOutlined title="Show markdown" onClick={() => handleMarkdownToggle()} />
    </div>
  );
}
