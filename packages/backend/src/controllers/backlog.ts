import { Backlog, Epic, UserSession } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import express from 'express';
import fs from 'fs';
import ExcelJS from 'exceljs';
import backlogService from '../services/backlog.service';
import backlogCsvService from '../services/backlogCsv.service';
import {
  BadRequestError,
  getDefaultErrorRes,
  assertProjectIdIsValid,
  assertEpicNameIsValid,
  assertInputIsNotEmpty,
} from '../helpers/error';
import { sendToProject } from '../notifications/NotificationHandler';
import { BacklogFields } from '../helpers/types/backlog.service.types';
import { convertXlsxToCsv, addDropdownValidation } from '../helpers/xlsx';

const newBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const backlog: Backlog = await backlogService.newBacklog(req.body);
    const { projectId, summary, priority }: BacklogFields = req.body;
    sendToProject(projectId, `Backlog added: ${summary}, priority: ${priority}`);
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listBacklogsByProjectId = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new BadRequestError('projectId cannot be empty');
    }
    const backlogs: Backlog[] = await backlogService.listBacklogsByProjectId(Number(projectId));
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const listBacklogs = async (req: express.Request, res: express.Response) => {
  try {
    const backlogs: Backlog[] = await backlogService.listBacklogs(res.locals.policyConstraint);
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.params;
    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog | null = await backlogService.getBacklog(Number(projectId), Number(backlogId));
    if (backlog === null) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Backlog not found' });
    }
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const updateBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId, fieldToUpdate } = req.body;
    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog = await backlogService.updateBacklog(req.body);
    sendToProject(projectId, `Backlog ${backlogId} updated, fields updated: ${Object.keys(fieldToUpdate)}`);

    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteBacklog = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId } = req.params;
    if (!projectId || !backlogId) {
      throw new BadRequestError('projectId or backlogId cannot be empty');
    }
    const backlog: Backlog = await backlogService.deleteBacklog(Number(projectId), Number(backlogId));
    sendToProject(Number(projectId), `Backlog ${backlogId} deleted`);

    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const createEpic = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, name, description } = req.body;
    assertProjectIdIsValid(projectId);
    assertEpicNameIsValid(name);

    const epic: Epic = await backlogService.createEpic(Number(projectId), name, description);
    sendToProject(Number(projectId), `Epic created: ${name}`);
    return res.status(StatusCodes.OK).json(epic);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getBacklogsForEpic = async (req: express.Request, res: express.Response) => {
  try {
    const { epicId } = req.params;
    if (!epicId) {
      throw new BadRequestError('epicId cannot be empty');
    }
    const backlogs: Backlog[] = await backlogService.getBacklogsForEpic(Number(epicId));
    return res.status(StatusCodes.OK).json(backlogs);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getEpicsForProject = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new BadRequestError('projectId cannot be empty');
    }
    const epics: Epic[] = await backlogService.getEpicsForProject(Number(projectId));
    return res.status(StatusCodes.OK).json(epics);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const getEpicById = async (req: express.Request, res: express.Response) => {
  try {
    const { epicId } = req.params;
    if (!epicId) {
      throw new BadRequestError('epicId cannot be empty');
    }
    const epic: Epic | null = await backlogService.getEpicById(Number(epicId));
    return res.status(StatusCodes.OK).json(epic);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const addBacklogToEpic = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId, epicId } = req.body;
    if (!projectId || !backlogId || !epicId) {
      throw new BadRequestError('projectId or backlogId or epicId cannot be empty');
    }
    const epic: Epic | null = await backlogService.getEpicById(Number(epicId));
    if (!epic || epic.project_id !== Number(projectId)) {
      throw new BadRequestError('Adding backlog to an epic of different project is not allowed');
    }
    const backlog: Backlog = await backlogService.addBacklogToEpic(
      Number(projectId),
      Number(epicId),
      Number(backlogId),
    );
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const removeBacklogFromEpic = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId, backlogId, epicId } = req.body;
    if (!projectId || !backlogId || !epicId) {
      throw new BadRequestError('projectId or backlogId or epicId cannot be empty');
    }
    const epic: Epic | null = await backlogService.getEpicById(epicId);
    if (!epic || epic.project_id !== Number(projectId)) {
      throw new BadRequestError('Removing backlog from an epic of different project is not allowed');
    }
    const backlog: Backlog = await backlogService.removeBacklogFromEpic(
      Number(projectId),
      Number(epicId),
      Number(backlogId),
    );
    return res.status(StatusCodes.OK).json(backlog);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const importBacklogCsv = async (req: express.Request, res: express.Response) => {
  let convertedCsvPath: string | undefined;
  try {
    const { projectId } = req.params;

    assertInputIsNotEmpty(req.file, 'Csv file');
    assertProjectIdIsValid(Number(projectId));

    const userSession = res.locals.userSession as UserSession | undefined;
    assertInputIsNotEmpty(userSession, 'userSession');

    const isXlsx = req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      || req.file.originalname?.endsWith('.xlsx');
    const isCsv = req.file.mimetype.includes('csv');

    if (!isXlsx && !isCsv) {
      throw new Error('Invalid file type. File must be CSV or XLSX.');
    }

    let filePath = req.file.path;
    if (isXlsx) {
      convertedCsvPath = await convertXlsxToCsv(req.file.path);
      filePath = convertedCsvPath;
    }

    const result = await backlogCsvService.importBacklogData(filePath, Number(projectId), userSession.user_id);
    sendToProject(Number(projectId), 'Backlogs imported from CSV');
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  } finally {
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    if (convertedCsvPath && fs.existsSync(convertedCsvPath)) {
      fs.unlinkSync(convertedCsvPath);
    }
  }
};

const getBacklogImportTemplate = async (req: express.Request, res: express.Response) => {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(Number(projectId));

    // Fetch project data for dropdowns
    const { sprints, epics, members } = await backlogService.getProjectData(Number(projectId));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Import Backlogs');

    // Headers and column widths
    sheet.addRow(['summary', 'type', 'sprint', 'epic', 'priority', 'points', 'reporter', 'assignee', 'description']);
    sheet.getRow(1).font = { bold: true };
    sheet.columns = [
      { width: 35 }, // A: summary
      { width: 15 }, // B: type
      { width: 20 }, // C: sprint
      { width: 20 }, // D: epic
      { width: 15 }, // E: priority
      { width: 10 }, // F: points
      { width: 30 }, // G: reporter
      { width: 30 }, // H: assignee
      { width: 40 }, // I: description
    ];

    // Example row (skipped during import)
    sheet.addRow([
      'User Story Title',
      'story, task, or bug',
      'Sprint name (Optional)',
      'Epic name (Optional, new epics created automatically)',
      'very_high to very_low (Optional)',
      'Story points (Optional)',
      'Reporter email (Optional, defaults to you)',
      'Assignee email (Optional)',
      'Description text (Optional)',
    ]);
    sheet.getRow(2).font = { italic: true, color: { argb: 'FF888888' } };

    // Type dropdown (column B)
    addDropdownValidation(sheet, 'B', ['story', 'task', 'bug'], true, 'Must be story, task, or bug');

    // Sprint dropdown (column C)
    addDropdownValidation(sheet, 'C', [...sprints.map((s) => s.name), '<Enter New Sprint Name>']);

    // Epic dropdown (column D)
    addDropdownValidation(sheet, 'D', [...epics.map((e) => e.name), '<Enter New Epic Name>']);

    // Priority dropdown (column E)
    addDropdownValidation(sheet, 'E', ['very_high', 'high', 'medium', 'low', 'very_low']);

    // Reporter dropdown (column G) and Assignee dropdown (column H)
    if (members.length > 0) {
      const memberEmails = members.map((m) => m.user.user_email);
      addDropdownValidation(sheet, 'G', memberEmails);
      addDropdownValidation(sheet, 'H', memberEmails);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=importBacklogData.xlsx');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const deleteEpic = async (req: express.Request, res: express.Response) => {
  try {
    const { epicId } = req.params;
    if (!epicId) {
      throw new BadRequestError('epicId cannot be empty');
    }
    const epic: Epic = await backlogService.deleteEpic(Number(epicId));
    sendToProject(Number(epic.project_id), `Epic ${epic.name} deleted`);

    return res.status(StatusCodes.OK).json(epic);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  newBacklog,
  listBacklogsByProjectId,
  listBacklogs,
  getBacklog,
  updateBacklog,
  deleteBacklog,
  importBacklogCsv,
  getBacklogImportTemplate,
  createEpic,
  getBacklogsForEpic,
  getEpicsForProject,
  getEpicById,
  addBacklogToEpic,
  removeBacklogFromEpic,
  deleteEpic,
};
