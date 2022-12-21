import React, { useState } from 'react';
import { Avatar, Button, Dropdown, Form, List, Menu, message, Modal, Space, Input } from 'antd';
import { CommentOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useDeleteCommentMutation, useGetCommentsQuery, useUpdateCommentMutation } from '../../api/comment';
import type { Comment as CommentType } from '../../api/types';
import './Comment.css';

function Comment(): JSX.Element {
  const { TextArea } = Input;
  const params = useParams();
  const projectId = Number(params.projectId);
  const backlogId = Number(params.backlogId);

  const { data: comments } = useGetCommentsQuery({ projectId, backlogId });
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();

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
      stopEditingComment(commentId);
    } catch (e) {
      message.error('Failed to update comment');
      console.error(e);
    }
  };

  const processCommentsStates = () => {
    const states: { [key: number]: boolean } = {};
    comments?.forEach((comment) => {
      states[comment.comment_id] = false;
    });

    return states;
  };

  // Storing delete modal and editing states in objects for each comment
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<{ [key: number]: boolean }>(processCommentsStates());
  const [isEditingComment, setIsEditingComment] = useState<{ [key: number]: boolean }>(processCommentsStates());

  // For delete modal
  const openDeleteConfirmationModal = (commentId: number) => {
    const updatedDeleteModalStates = {
      ...isDeleteModalOpen,
    };
    updatedDeleteModalStates[commentId] = true;
    setIsDeleteModalOpen(updatedDeleteModalStates);
  };

  const closeDeleteConfirmationModal = (commentId: number) => {
    const updatedDeleteModalStates = {
      ...isDeleteModalOpen,
    };
    updatedDeleteModalStates[commentId] = false;
    setIsDeleteModalOpen(updatedDeleteModalStates);
  };

  // For editing comment
  const startEditingComment = (commentId: number) => {
    const updatedEditingCommentStates = {
      ...isEditingComment,
    };
    stopEditingAllComments(updatedEditingCommentStates);
    updatedEditingCommentStates[commentId] = true;
    setIsEditingComment(updatedEditingCommentStates);
  };

  const stopEditingComment = (commentId: number) => {
    const updatedEditingCommentStates = {
      ...isEditingComment,
    };
    updatedEditingCommentStates[commentId] = false;
    setIsEditingComment(updatedEditingCommentStates);
  };

  // Set all editing states to false
  const stopEditingAllComments = (commentStates: { [key: number | string]: boolean }) =>
    // eslint-disable-next-line no-return-assign, no-param-reassign
    Object.keys(commentStates).forEach((v: string) => (commentStates[v] = false));

  const renderUpdateCommentTextArea = (comment: CommentType) => (
    <div className="editing-comment-container">
      <List.Item.Meta
        className="comment-content-container"
        avatar={<Avatar icon={<UserOutlined />} />}
        title={comment.commenter.user.user_email}
      />
      <Form onFinish={(formData) => handleUpdateComment(formData, comment.comment_id)}>
        <Form.Item name="updatedComment" initialValue={comment.content}>
          <TextArea autoSize={{ minRows: 1 }} placeholder="Update comment..." />
        </Form.Item>
        <Button onClick={() => stopEditingComment(comment.comment_id)}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Update
        </Button>
      </Form>
    </div>
  );

  const renderCommentList = (comment: CommentType) => {
    const menuItems = (
      <Menu
        items={[
          {
            key: `${comment.comment_id}-edit`,
            label: (
              /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
              <div onClick={() => startEditingComment(comment.comment_id)}>Edit</div>
            ),
          },
          {
            key: `${comment.comment_id}-delete`,
            danger: true,
            label: (
              /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
              <div onClick={() => openDeleteConfirmationModal(comment.comment_id)}>Delete</div>
            ),
          },
        ]}
      />
    );

    return (
      <>
        <List.Item.Meta
          className="comment-content-container"
          avatar={<Avatar icon={<UserOutlined />} />}
          title={comment.commenter.user.user_email}
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
      visible={isDeleteModalOpen[comment.comment_id]}
      onOk={() => handleDeleteComment(comment.comment_id)}
      onCancel={() => closeDeleteConfirmationModal(comment.comment_id)}
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
    <List
      locale={{
        emptyText: (
          <>
            <CommentOutlined style={{ fontSize: '34px' }} />
            <p>No Comment</p>
          </>
        ),
      }}
      className="comment-list"
      itemLayout="horizontal"
      dataSource={comments}
      renderItem={(comment) => (
        <>
          <List.Item>
            {isEditingComment[comment.comment_id] ? renderUpdateCommentTextArea(comment) : renderCommentList(comment)}
          </List.Item>
          {renderDeleteModal(comment)}
        </>
      )}
    />
  );
}

export default Comment;
