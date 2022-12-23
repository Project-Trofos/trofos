import { Comment } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import {
  assertBacklogIdIsValid,
  assertCommentIdIsValid,
  assertCommentIsValid,
  assertProjectIdIsValid,
  assertUserIdIsValid,
  getDefaultErrorRes,
} from '../helpers/error';
import commentService from '../services/comment.service';

const create = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId, commenterId, content } = req.body;
    assertProjectIdIsValid(projectId);
    assertBacklogIdIsValid(backlogId);
    assertUserIdIsValid(commenterId);
    assertCommentIsValid(content);

    const comment: Comment = await commentService.create(
      Number(projectId),
      Number(backlogId),
      Number(commenterId),
      content,
    );
    return res.status(StatusCodes.OK).json(comment);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const list = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.params;
    assertProjectIdIsValid(projectId);
    assertBacklogIdIsValid(backlogId);

    const comments: Comment[] = await commentService.list(Number(projectId), Number(backlogId));
    return res.status(StatusCodes.OK).json(comments);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const update = async (req: express.Request, res: express.Response) => {
  try {
    const { commentId, updatedComment } = req.body;
    assertCommentIdIsValid(commentId);
    assertCommentIsValid(updatedComment);

    const comment: Comment = await commentService.update(Number(commentId), updatedComment);
    return res.status(StatusCodes.OK).json(comment);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const remove = async (req: express.Request, res: express.Response) => {
  try {
    const { commentId } = req.params;
    assertCommentIdIsValid(commentId);

    const comment: Comment = await commentService.remove(Number(commentId));
    return res.status(StatusCodes.OK).json(comment);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  create,
  list,
  update,
  remove,
};
