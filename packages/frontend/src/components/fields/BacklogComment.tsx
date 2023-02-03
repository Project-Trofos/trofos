import React from 'react';
import { Button, Form, Input, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../../api/auth';
import { useCreateCommentMutation } from '../../api/comment';
import './BacklogComment.css';

function BacklogComment() {
  const { TextArea } = Input;

  const [form] = Form.useForm();

  const params = useParams();
  const projectId = Number(params.projectId);
  const backlogId = Number(params.backlogId);
  const { data: userInfo } = useGetUserInfoQuery();
  const [createComment] = useCreateCommentMutation();

  const handleSubmitNewComment = async (formData: { comment: string }) => {
    if (!userInfo?.userId || !formData.comment) {
      return;
    }

    try {
      const comment = await createComment({
        projectId,
        backlogId,
        commenterId: userInfo.userId,
        content: formData.comment,
      }).unwrap();
      form.resetFields();
    } catch (e) {
      message.error({ content: 'Failed to add comment', key: 'backlogComment' });
      console.error(e);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmitNewComment} className="new-comment-container">
      <Form.Item name="comment">
        <TextArea autoSize={{ minRows: 1 }} placeholder="Add new comment..." />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Add comment
      </Button>
    </Form>
  );
}

export default BacklogComment;
