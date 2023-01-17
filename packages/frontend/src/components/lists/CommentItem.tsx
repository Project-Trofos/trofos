import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Button, Dropdown, Form, Input, List, Menu, message, Modal, Space } from 'antd';
import { MenuOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Comment as CommentType } from '../../api/types';
import { useDeleteCommentMutation, useUpdateCommentMutation } from '../../api/comment';
import './CommentItem.css';

function CommentItem(props: { commentData: CommentType }): JSX.Element {
  const { commentData } = props;
  const { TextArea } = Input;
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();

  const wrapperRef = useRef<HTMLInputElement>(null);

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment({ commentId }).unwrap();
      message.success('Comment deleted');
    } catch (e) {
      message.error('Failed to delete comment');
      console.error(e);
    }
  };

  const handleUpdateComment = async (formData: { updatedComment: string }, commentId: number) => {
    if (!formData.updatedComment) {
      return;
    }
    try {
      const { updatedComment } = formData;
      await updateComment({ commentId, updatedComment }).unwrap();
      message.success('Comment updated');
      stopEditingComment();
    } catch (e) {
      message.error('Failed to update comment');
      console.error(e);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);

  // To close the editing mode when other areas are clicked
  function handleOutsideClick(event: MouseEvent) {
    if (isEditingComment && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setIsEditingComment(false);
    }
  }

  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [wrapperRef, isEditingComment]);

  // For delete modal
  const openDeleteConfirmationModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirmationModal = () => {
    setIsDeleteModalOpen(false);
  };

  // For editing comment
  const startEditingComment = () => {
    setIsEditingComment(true);
  };

  const stopEditingComment = () => {
    setIsEditingComment(false);
  };

  const renderUpdateCommentTextArea = (comment: CommentType) => (
    <div className="editing-comment-container">
      <List.Item.Meta
        className="comment-content-container"
        avatar={<Avatar icon={<UserOutlined />} />}
        title={
          <>
            {comment.commenter.user.user_email} &#x2022;{' '}
            <span className="comment-timestamp">{renderCommentTimestamp(comment)}</span>
          </>
        }
      />
      <Form onFinish={(formData) => handleUpdateComment(formData, comment.comment_id)}>
        <Form.Item name="updatedComment" initialValue={comment.content}>
          <TextArea autoSize={{ minRows: 1 }} placeholder="Update comment..." />
        </Form.Item>
        <Button onClick={() => stopEditingComment()}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Update
        </Button>
      </Form>
    </div>
  );

  const renderCommentTimestamp = (comment: CommentType) => {
    if (comment.updated_at) {
      return `${dayjs(comment.updated_at).format('D MMM YYYY, h:mm A')} (edited)`;
    }

    return dayjs(comment.created_at).format('D MMM YYYY, h:mm A');
  };

  const renderCommentList = (comment: CommentType) => {
    const menuItems = (
      <Menu
        items={[
          {
            key: `${comment.comment_id}-edit`,
            label: <div onClick={() => startEditingComment()}>Edit</div>,
          },
          {
            key: `${comment.comment_id}-delete`,
            danger: true,
            label: <div onClick={() => openDeleteConfirmationModal()}>Delete</div>,
          },
        ]}
      />
    );

    return (
      <>
        <List.Item.Meta
          className="comment-content-container"
          avatar={<Avatar icon={<UserOutlined />} />}
          title={
            <>
              {comment.commenter.user.user_email} &#x2022;{' '}
              <span className="comment-timestamp">{renderCommentTimestamp(comment)}</span>
            </>
          }
          description={comment.content}
        />
        <div className="comment-menu-button">
          <Dropdown className="backlog-menu-dropdown" overlay={menuItems} trigger={['click']} placement="bottomRight">
            <Space>
              <MenuOutlined style={{ fontSize: '18px' }} />
            </Space>
          </Dropdown>
        </div>
      </>
    );
  };

  const renderDeleteModal = (comment: CommentType) => (
    <Modal
      title="DELETE COMMENT"
      visible={isDeleteModalOpen}
      onOk={() => handleDeleteComment(comment.comment_id)}
      onCancel={() => closeDeleteConfirmationModal()}
      okText="Delete"
      okType="danger"
      cancelText="Cancel"
      closable={false}
    >
      <p>Are you sure you want to delete this comment?</p>
      <br />
      <p>Once this action is done, the comment will be permenantly removed</p>
    </Modal>
  );

  return (
    <div ref={wrapperRef}>
      <List.Item>
        {isEditingComment ? renderUpdateCommentTextArea(commentData) : renderCommentList(commentData)}
      </List.Item>
      {renderDeleteModal(commentData)}
    </div>
  );
}

export default CommentItem;
