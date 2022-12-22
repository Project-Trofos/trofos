import React from 'react';
import { List } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useGetCommentsQuery } from '../../api/comment';
import CommentItem from './CommentItem';
import './Comment.css';

function Comment(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const backlogId = Number(params.backlogId);

  const { data: comments } = useGetCommentsQuery({ projectId, backlogId });

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
      renderItem={(comment) => <CommentItem key={comment.comment_id} commentData={comment} />}
    />
  );
}

export default Comment;
