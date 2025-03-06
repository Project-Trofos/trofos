import express from 'express';
import issueService from '../services/issue.service';
import { Backlog, Issue } from '@prisma/client';
import { assertProjectIdIsValid, getDefaultErrorRes } from '../helpers/error';
import { StatusCodes } from 'http-status-codes';
import { assertIdIsValidNumber, assertUserIdIsValid } from '../helpers/error/assertions';

const newIssue = async (req: express.Request, res: express.Response) => {
  try {
    const { assignerProjectId, assigneeProjectId } = req.body;
    assertProjectIdIsValid(assignerProjectId);
    assertProjectIdIsValid(assigneeProjectId);

    const issue: Issue = await issueService.newIssue(req.body);
    return res.status(StatusCodes.OK).json(issue);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getAssignedIssuesByProjectId = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(projectId);

    const issues: Issue[] = await issueService.getAssignedIssuesByProjectId(Number(projectId));
    return res.status(StatusCodes.OK).json(issues);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getReportedIssuesByProjectId = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(projectId);

    const issues: Issue[] = await issueService.getReportedIssuesByProjectId(Number(projectId));
    return res.status(StatusCodes.OK).json(issues);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getIssue = async (req: express.Request, res: express.Response) => {
  try {
    const { issueId } = req.params;
    assertIdIsValidNumber(issueId, 'Issue ID');

    const issue: Issue = await issueService.getIssue(Number(issueId));

    return res.status(StatusCodes.OK).json(issue);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const updateIssue = async (req: express.Request, res: express.Response) => {
  try {
    const { issueId } = req.params;
    assertIdIsValidNumber(issueId, 'Issue ID');

    const issue: Issue = await issueService.updateIssue({ issueId: Number(issueId), fieldToUpdate: req.body });

    return res.status(StatusCodes.OK).json(issue);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteIssue = async (req: express.Request, res: express.Response) => {
  try {
    const { issueId } = req.params;
    assertIdIsValidNumber(issueId, 'Issue ID');

    const issue: Issue = await issueService.deleteIssue(Number(issueId));
    return res.status(StatusCodes.OK).json(issue);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const createBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { issueId } = req.params;
    assertIdIsValidNumber(issueId, 'Issue ID');

    const backlog: Backlog = await issueService.createBacklogFromIssue(Number(issueId), req.body);
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  newIssue,
  getAssignedIssuesByProjectId,
  getReportedIssuesByProjectId,
  getIssue,
  updateIssue,
  deleteIssue,
  createBacklog,
};
