import React from 'react';
import { Button, Form, Input, message } from 'antd';
import { useGetUserInfoQuery } from '../../api/auth';
import { useCreateIssueCommentMutation } from '../../api/comment';
import './BacklogComment.css';

interface IssueCommentProps {
  issueId: number;
}

function IssueComment({ issueId }: IssueCommentProps) {
  const { TextArea } = Input;

  const [form] = Form.useForm();
  const { data: userInfo } = useGetUserInfoQuery();
  const [createComment] = useCreateIssueCommentMutation();

  const handleSubmitNewComment = async (formData: { comment: string }) => {
    if (!userInfo?.userId || !formData.comment) {
      return;
    }

    try {
      const comment = await createComment({
        issueId,
        commenterId: userInfo.userId,
        content: formData.comment,
      }).unwrap();
      form.resetFields();
    } catch (e) {
      message.error({ content: 'Failed to add comment', key: 'issueComment' });
      console.error(e);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmitNewComment} className="new-comment-container">
      <Form.Item name="comment">
        <TextArea style={{ borderRadius: '8px' }} autoSize={{ minRows: 1 }} placeholder="Add new comment..." />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Add comment
      </Button>
    </Form>
  );
}

export default IssueComment;
