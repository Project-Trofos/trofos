import { Backlog, BacklogStatusType, BacklogType, Issue, IssueType, Prisma } from '@prisma/client';
import prisma from '../models/prismaClient';
import { BacklogFromIssueFields, IssueFields } from '../helpers/types/issue.service.types';
import projectAssignmentService from './projectAssignment.service';
import { BacklogFields } from '../helpers/types/backlog.service.types';
import backlogService from './backlog.service';

const issueTypeToBacklogTypeMap: Map<IssueType, BacklogType> = new Map([
  [IssueType.bug, BacklogType.bug],
  [IssueType.enhancement, BacklogType.story],
  [IssueType.task, BacklogType.task],
]);

async function newIssue(issueFields: IssueFields): Promise<Issue> {
  const { title, description, status, type, priority, reporterId, assignerProjectId, assigneeProjectId } = issueFields;

  return prisma.$transaction<Issue>(async (tx: Prisma.TransactionClient) => {
    if (
      !(await projectAssignmentService.isProjectAssigned(assignerProjectId, assigneeProjectId)) &&
      assignerProjectId !== assigneeProjectId
    ) {
      throw new Error('Assignee project is not assigned to the assigner project');
    }

    return tx.issue.create({
      data: {
        title,
        description,
        status,
        type,
        priority,
        reporter: {
          connect: {
            project_id_user_id: {
              project_id: assignerProjectId,
              user_id: reporterId,
            },
          },
        },
        assigner: {
          connect: {
            id: assignerProjectId,
          },
        },
        assignee: {
          connect: {
            id: assigneeProjectId,
          },
        },
      },
    });
  });
}

// Get all issues assigned to a project
async function getAssignedIssuesByProjectId(projectId: number): Promise<Issue[]> {
  return prisma.issue.findMany({
    where: {
      assignee_project_id: projectId,
    },
    include: {
      reporter: {
        select: {
          user: {
            select: {
              user_display_name: true,
              user_email: true,
            },
          },
        },
      },
      assigner: {
        select: {
          id: true,
          pname: true,
        },
      },
      backlog: {
        select: {
          backlog_id: true,
        },
      },
    },
  });
}

// Get all issues reported by a project
async function getReportedIssuesByProjectId(projectId: number): Promise<Issue[]> {
  return prisma.issue.findMany({
    where: {
      assigner_project_id: projectId,
    },
    include: {
      reporter: {
        select: {
          user: {
            select: {
              user_display_name: true,
              user_email: true,
            },
          },
        },
      },
      assignee: {
        select: {
          id: true,
          pname: true,
        },
      },
      backlog: {
        select: {
          backlog_id: true,
        },
      },
    },
  });
}

async function getIssue(issueId: number): Promise<Issue> {
  return prisma.issue.findUniqueOrThrow({
    where: {
      id: issueId,
    },
  });
}

async function updateIssue(issueToUpdate: { issueId: number; fieldToUpdate: Partial<IssueFields> }): Promise<Issue> {
  const { issueId, fieldToUpdate } = issueToUpdate;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const issue = await tx.issue.findUniqueOrThrow({
      where: {
        id: issueId,
      },
    });

    const updatedFields: any = { ...fieldToUpdate };

    // Modify updatedFields in-place to ensure correct relational updates
    if (updatedFields.reporterId) {
      updatedFields.reporter = {
        connect: {
          project_id_user_id: {
            project_id: issue.assigner_project_id, //assigner project cannot be updated
            user_id: updatedFields.reporterId,
          },
        },
      };
      delete updatedFields.reporterId;
    }

    if (updatedFields.assigneeProjectId) {
      updatedFields.assignee = {
        connect: {
          id: updatedFields.assigneeProjectId,
        },
      };
      delete updatedFields.assigneeProjectId;
    }

    return tx.issue.update({
      where: {
        id: issueId,
      },
      data: updatedFields,
    });
  });
}

async function deleteIssue(issueId: number): Promise<Issue> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const issue = await tx.issue.findUniqueOrThrow({
      where: {
        id: issueId,
      },
    });

    return tx.issue.delete({
      where: {
        id: issueId,
      },
    });
  });
}

async function createBacklogFromIssue(
  issueId: number,
  backlogFromIssueFields: BacklogFromIssueFields,
): Promise<Backlog> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const issue = await tx.issue.findUniqueOrThrow({
      where: {
        id: issueId,
      },
      include: {
        backlog: true,
      },
    });

    // Prevent duplicate backlog creation
    if (issue.backlog && issue.backlog.backlog_id) {
      throw new Error(`Issue ${issueId} is already linked to backlog ${issue.backlog.backlog_id}`);
    }

    // Prepare backlog fields
    const backlogFields: BacklogFields = {
      ...backlogFromIssueFields,
      type: issueTypeToBacklogTypeMap.get(backlogFromIssueFields.type) || BacklogType.bug,
    };

    const createdBacklog = await backlogService.newBacklog(backlogFields);

    await tx.issue.update({
      where: {
        id: issueId,
      },
      data: {
        backlog: {
          connect: {
            project_id_backlog_id: {
              project_id: createdBacklog.project_id,
              backlog_id: createdBacklog.backlog_id,
            },
          },
        },
      },
    });

    return createdBacklog;
  });
}

export default {
  newIssue,
  getAssignedIssuesByProjectId,
  getReportedIssuesByProjectId,
  getIssue,
  updateIssue,
  deleteIssue,
  createBacklogFromIssue,
};
