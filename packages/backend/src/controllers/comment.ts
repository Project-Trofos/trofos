import { Backlog, BacklogComment, BaseComment, Project, User, UsersOnProjectOnSettings } from '@prisma/client';
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
import projectService from '../services/project.service';
import backlogService from '../services/backlog.service';
import userService from '../services/user.service';
import ses from '../aws/ses';
import { commentSubject, commentBody } from '../templates/email';
import { BacklogCommentWithBase, IssueCommentWithBase } from '../helpers/types/comment.service.types';
import { assertIdIsValidNumber } from '../helpers/error/assertions';

const getDataForEmail = async (comment: BacklogComment) => {
  const backlogData: Backlog = (await backlogService.getBacklog(comment.project_id, comment.backlog_id)) as Backlog;
  const projectData: Project = await projectService.getById(comment.project_id);
  const commenterData: User = await userService.get(comment.commenter_id);
  const reporterData: User = await userService.get(backlogData.reporter_id);
  const reporterSettings: UsersOnProjectOnSettings | null = await projectService.getUserSettings(
    projectData.id,
    reporterData.user_id,
  );
  let assigneeData: User | undefined;
  let assingeeSettings: UsersOnProjectOnSettings | null | undefined;

  // Skip fetching assignee if null or reporter and assignee is the same user
  if (backlogData.assignee_id && backlogData.assignee_id !== backlogData.reporter_id) {
    assigneeData = await userService.get(backlogData.assignee_id);
    assingeeSettings = await projectService.getUserSettings(projectData.id, assigneeData.user_id);
  }

  return {
    projectData,
    backlogData,
    commenterData,
    reporterData,
    reporterSettings,
    assigneeData,
    assingeeSettings,
  };
};

const sendEmail = async (comment: BacklogCommentWithBase) => {
  if (!ses.isESPEnabled()) return;
  const { projectData, backlogData, commenterData, reporterData, reporterSettings, assigneeData, assingeeSettings } =
    await getDataForEmail(comment);
  const backlogIdentifier = projectData.pkey
    ? `${projectData.pkey}-${backlogData.backlog_id}`
    : `${backlogData.backlog_id}`;
  const subject = commentSubject(projectData.pname, backlogIdentifier);
  const body = commentBody(
    commenterData.user_display_name,
    comment.base_comment.content,
    projectData.id,
    backlogData.backlog_id,
  );

  if (commenterData.user_id !== reporterData.user_id && reporterSettings?.email_notification) {
    await ses.sendEmail(reporterData.user_email, subject, body);
  }

  if (assigneeData && commenterData.user_id !== assigneeData.user_id && assingeeSettings?.email_notification) {
    await ses.sendEmail(assigneeData.user_email, subject, body);
  }
};

const create = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId, commenterId, content } = req.body;
    assertProjectIdIsValid(projectId);
    assertBacklogIdIsValid(backlogId);
    assertUserIdIsValid(commenterId);
    assertCommentIsValid(content);

    const comment: BacklogCommentWithBase = await commentService.create(
      Number(projectId),
      Number(backlogId),
      Number(commenterId),
      content,
    );

    await sendEmail(comment);

    return res.status(StatusCodes.OK).json(comment);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const createIssueComment = async (req: express.Request, res: express.Response) => {
  try {
    const { issueId, commenterId, content } = req.body;
    assertIdIsValidNumber(issueId, 'issueId');
    assertUserIdIsValid(commenterId);
    assertCommentIsValid(content);

    const comment: IssueCommentWithBase = await commentService.createIssueComment(
      Number(issueId),
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

    const comments: BacklogCommentWithBase[] = await commentService.list(Number(projectId), Number(backlogId));
    return res.status(StatusCodes.OK).json(comments);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listIssueComments = async (req: express.Request, res: express.Response) => {
  try {
    const { issueId } = req.params;
    assertIdIsValidNumber(issueId, 'issueId');

    const comments: IssueCommentWithBase[] = await commentService.listIssueComments(Number(issueId));
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

    const comment: BaseComment = await commentService.update(Number(commentId), updatedComment);
    return res.status(StatusCodes.OK).json(comment);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const remove = async (req: express.Request, res: express.Response) => {
  try {
    const { commentId } = req.params;
    assertCommentIdIsValid(commentId);

    const comment: BaseComment = await commentService.remove(Number(commentId));
    return res.status(StatusCodes.OK).json(comment);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  create,
  createIssueComment,
  list,
  listIssueComments,
  update,
  remove,
};
