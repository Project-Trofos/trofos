import React from 'react';
import { List } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import CommentItem from './CommentItem';
import './Comment.css';
import { BacklogComment, CommonComment, IssueComment } from '../../api/types';

interface CommentProps {
  comments: BacklogComment[] | IssueComment[] | undefined;
}

function Comment({ comments }: CommentProps): JSX.Element {
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
      renderItem={(comment: CommonComment) => <CommentItem key={comment.comment_id} commentData={comment} />}
    />
  );
}

export default Comment;
