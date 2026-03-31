import * as csv from '@fast-csv/parse';
import { BacklogStatusType, Epic, HistoryType, Prisma, Sprint, SprintStatus } from '@prisma/client';
import {
  BACKLOG_PRIORITY_MAP,
  BACKLOG_TYPE_MAP,
  IMPORT_BACKLOG_DATA_CONFIG,
  ImportBacklogDataCsv,
  INVALID_ASSIGNEE,
  INVALID_REPORTER,
  INVALID_EPIC,
  INVALID_POINTS,
  INVALID_PRIORITY,
  INVALID_SPRINT,
  INVALID_SUMMARY,
  INVALID_TYPE,
} from './types/backlogCsv.service.types';
import prisma from '../models/prismaClient';

const MESSAGE_SPACE = ' ';

function validateSummary(data: ImportBacklogDataCsv): boolean {
  return !!data.summary?.trim().length;
}

function validateType(data: ImportBacklogDataCsv): boolean {
  return BACKLOG_TYPE_MAP.has(data.type.trim().toUpperCase());
}

function validatePriority(data: ImportBacklogDataCsv): boolean {
  if (!data.priority) return true; // optional
  return BACKLOG_PRIORITY_MAP.has(data.priority.trim().toUpperCase());
}

function validatePoints(data: ImportBacklogDataCsv): boolean {
  if (!data.points) return true; // optional
  const num = Number(data.points.trim());
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

function validateSprint(data: ImportBacklogDataCsv, _sprintMap: Map<string, Sprint>): boolean {
  if (!data.sprint) return true;
  if (data.sprint.trim() === '<Enter New Sprint Name>') return false;
  return true;
}

function validateEpic(data: ImportBacklogDataCsv, _epicMap: Map<string, Epic>): boolean {
  if (!data.epic) return true;
  if (data.epic.trim() === '<Enter New Epic Name>') return false;
  return true;
}

function validateAssignee(data: ImportBacklogDataCsv, memberEmailMap: Map<string, number>): boolean {
  if (!data.assignee) return true; // optional
  return memberEmailMap.has(data.assignee.trim().toLowerCase());
}

function validateReporter(data: ImportBacklogDataCsv, memberEmailMap: Map<string, number>): boolean {
  if (!data.reporter) return true; // optional - defaults to current user
  return memberEmailMap.has(data.reporter.trim().toLowerCase());
}

function validateImportBacklogData(
  data: ImportBacklogDataCsv,
  sprintMap: Map<string, Sprint>,
  epicMap: Map<string, Epic>,
  memberEmailMap: Map<string, number>,
  callback: csv.RowValidateCallback,
) {
  let errorMessages = '';
  if (!validateSummary(data)) {
    errorMessages += INVALID_SUMMARY + MESSAGE_SPACE;
  }
  if (!validateType(data)) {
    errorMessages += INVALID_TYPE + MESSAGE_SPACE;
  }
  if (!validatePriority(data)) {
    errorMessages += INVALID_PRIORITY + MESSAGE_SPACE;
  }
  if (!validatePoints(data)) {
    errorMessages += INVALID_POINTS + MESSAGE_SPACE;
  }
  if (!validateSprint(data, sprintMap)) {
    errorMessages += INVALID_SPRINT + MESSAGE_SPACE;
  }
  if (!validateEpic(data, epicMap)) {
    errorMessages += INVALID_EPIC + MESSAGE_SPACE;
  }
  if (!validateReporter(data, memberEmailMap)) {
    errorMessages += INVALID_REPORTER + MESSAGE_SPACE;
  }
  if (!validateAssignee(data, memberEmailMap)) {
    errorMessages += INVALID_ASSIGNEE + MESSAGE_SPACE;
  }
  if (errorMessages) {
    return callback(null, false, errorMessages.trimEnd());
  }
  return callback(null, true);
}

async function processImportBacklogData(
  projectId: number,
  reporterId: number,
  rows: ImportBacklogDataCsv[],
  sprintMap: Map<string, Sprint>,
  epicMap: Map<string, Epic>,
  memberEmailMap: Map<string, number>,
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const backlogCounter = await tx.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { backlog_counter: true },
    });

    const defaultBacklogStatus = await tx.backlogStatus.findFirst({
      where: {
        project_id: projectId,
        type: BacklogStatusType.todo,
        order: 1,
      },
      select: { name: true },
    });

    const statusName = defaultBacklogStatus?.name || 'To do';
    let currentCounter = backlogCounter.backlog_counter;

    for (const row of rows) {
      currentCounter += 1;

      const type = BACKLOG_TYPE_MAP.get(row.type.trim().toUpperCase())!;
      const priority = row.priority ? BACKLOG_PRIORITY_MAP.get(row.priority.trim().toUpperCase()) || null : null;
      const points = row.points ? Number(row.points.trim()) : null;
      let sprintId: number | undefined;
      const sprintName = row.sprint?.trim();
      if (sprintName) {
        const existing = sprintMap.get(sprintName);
        if (existing) {
          sprintId = existing.id;
        } else {
          const newSprint = await tx.sprint.create({
            data: {
              name: sprintName,
              project_id: projectId,
              duration: 2, // 2 weeks default
              start_date: new Date(),
              end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              status: SprintStatus.upcoming,
            },
          });
          sprintMap.set(sprintName, newSprint);
          sprintId = newSprint.id;
        }
      }
      let epicId: number | undefined;
      const epicName = row.epic?.trim();
      if (epicName) {
        const existing = epicMap.get(epicName);
        if (existing) {
          epicId = existing.epic_id;
        } else {
          // Create new epic if it doesn't exist
          const newEpic = await tx.epic.create({
            data: { name: epicName, project_id: projectId },
          });
          epicMap.set(epicName, newEpic);
          epicId = newEpic.epic_id;
        }
      }
      const rowReporterId = row.reporter ? memberEmailMap.get(row.reporter.trim().toLowerCase())! : reporterId;
      const assigneeId = row.assignee ? memberEmailMap.get(row.assignee.trim().toLowerCase()) : undefined;

      await tx.backlog.create({
        data: {
          backlog_id: currentCounter,
          summary: row.summary.trim(),
          type,
          ...(sprintId && {
            sprint: { connect: { id: sprintId } },
          }),
          priority,
          reporter: {
            connect: {
              project_id_user_id: {
                user_id: rowReporterId,
                project_id: projectId,
              },
            },
          },
          ...(assigneeId && {
            assignee: {
              connect: {
                project_id_user_id: {
                  user_id: assigneeId,
                  project_id: projectId,
                },
              },
            },
          }),
          ...(epicId && {
            epic: { connect: { epic_id: epicId } },
          }),
          points,
          description: row.description?.trim() || null,
          backlogStatus: {
            connect: {
              project_id_name: {
                project_id: projectId,
                name: statusName,
              },
            },
          },
          project: {
            connect: { id: projectId },
          },
        },
      });

      await tx.backlogHistory.create({
        data: {
          history_type: HistoryType.create,
          reporter_id: rowReporterId,
          backlog_id: currentCounter,
          type,
          ...(sprintId && {
            sprint: { connect: { id: sprintId } },
          }),
          priority,
          points,
          backlogStatus: {
            connect: {
              project_id_name: {
                project_id: projectId,
                name: statusName,
              },
            },
          },
          project: {
            connect: { id: projectId },
          },
        },
      });
    }

    await tx.project.update({
      where: { id: projectId },
      data: {
        backlog_counter: currentCounter,
      },
    });
  });
}

async function importBacklogData(
  csvFilePath: string,
  projectId: number,
  reporterId: number,
): Promise<void> {
  // Verify the reporter is a member of the project
  const membership = await prisma.usersOnProjects.findUnique({
    where: {
      project_id_user_id: {
        project_id: projectId,
        user_id: reporterId,
      },
    },
  });
  if (!membership) {
    throw new Error('You must be a member of this project to import backlogs');
  }

  // Pre-fetch sprints for this project
  const sprints = await prisma.sprint.findMany({
    where: { project_id: projectId },
  });
  const sprintMap = new Map<string, Sprint>();
  for (const sprint of sprints) {
    sprintMap.set(sprint.name, sprint);
  }

  // Pre-fetch epics for this project
  const epics = await prisma.epic.findMany({
    where: { project_id: projectId },
  });
  const epicMap = new Map<string, Epic>();
  for (const epic of epics) {
    epicMap.set(epic.name, epic);
  }

  // Pre-fetch project members (email -> user_id)
  const members = await prisma.usersOnProjects.findMany({
    where: { project_id: projectId },
    include: { user: { select: { user_email: true } } },
  });
  const memberEmailMap = new Map<string, number>();
  for (const member of members) {
    memberEmailMap.set(member.user.user_email.toLowerCase(), member.user_id);
  }

  return new Promise((resolve, reject) => {
    const errors: string[] = [];
    const rows: ImportBacklogDataCsv[] = [];
    const csvParseStream = csv.parseFile<ImportBacklogDataCsv, ImportBacklogDataCsv>(
      csvFilePath,
      IMPORT_BACKLOG_DATA_CONFIG,
    );

    csvParseStream
      .validate((data: ImportBacklogDataCsv, callback: csv.RowValidateCallback): void => {
        validateImportBacklogData(data, sprintMap, epicMap, memberEmailMap, callback);
      })
      .on('error', (error) => {
        errors.push(error.message);
      })
      .on('data-invalid', (row: ImportBacklogDataCsv, rowNumber, reason) => {
        errors.push(`Row ${rowNumber} (${row.summary || 'empty'}): ${reason}`);
      })
      .on('data', (row: ImportBacklogDataCsv) => {
        rows.push(row);
      })
      .on('finish', async () => {
        if (errors.length > 0) {
          reject(new Error(errors.join('\n')));
          return;
        }
        try {
          await processImportBacklogData(projectId, reporterId, rows, sprintMap, epicMap, memberEmailMap);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
  });
}

export default {
  importBacklogData,
  validateImportBacklogData,
  processImportBacklogData,
};
