import React from 'react';
import { List } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import CommentItem from './CommentItem';
import './Comment.css';
import { BacklogComment, CommonComment, IssueComment } from '../../api/types';

interface CommentProps {
  comments: BacklogComment[] | IssueComment[] | undefined;
}

const parseToCommonComment = (comment: BacklogComment | IssueComment): CommonComment => ({
  comment_id: comment.comment_id,
  commenter_id: comment.commenter_id,
  base_comment: comment.base_comment,
  commenter: comment.commenter,
});

function Comment({ comments }: CommentProps): JSX.Element {
  const parsedComments: CommonComment[] = comments?.map(parseToCommonComment) || [];

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
      dataSource={parsedComments}
      renderItem={(comment: CommonComment) => <CommentItem key={comment.comment_id} commentData={comment} />}
    />
  );
}

export default Comment;
