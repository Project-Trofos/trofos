import dayjs from 'dayjs';
import type {
  ParsedBacklogFields,
  ParsedEpicFields,
  ParsedSprintFields,
  ParseWorkItemResponse,
  WorkItemContext,
} from './aiItemCreation.types';

function findByName<T extends { id: number; name: string }>(
  items: T[] | undefined,
  name: string | undefined,
): number | undefined {
  if (!name || !items?.length) {
    return undefined;
  }
  const normalized = name.trim().toLowerCase();
  const exact = items.find((item) => item.name.trim().toLowerCase() === normalized);
  if (exact) {
    return exact.id;
  }
  const partial = items.find((item) => item.name.trim().toLowerCase().includes(normalized));
  return partial?.id;
}

function findUserId(
  users: WorkItemContext['users'],
  displayName: string | undefined,
): number | undefined {
  if (!displayName || !users?.length) {
    return undefined;
  }
  const normalized = displayName.trim().toLowerCase();
  const match = users.find(
    (u) =>
      u.displayName.trim().toLowerCase() === normalized ||
      u.email.trim().toLowerCase() === normalized ||
      u.displayName.trim().toLowerCase().includes(normalized),
  );
  return match?.id;
}

export function mapAiResponseToFormValues(
  response: ParseWorkItemResponse,
  context?: WorkItemContext,
): Record<string, unknown> {
  switch (response.itemType) {
    case 'backlog': {
      const fields = response.fields as ParsedBacklogFields;
      return {
        summary: fields.summary,
        type: fields.type ?? 'story',
        description: fields.description,
        priority: fields.priority,
        points: fields.points,
        sprintId: findByName(context?.sprints, fields.sprintName),
        epicId: findByName(context?.epics, fields.epicName),
        assigneeId: findUserId(context?.users, fields.assigneeDisplayName),
        reporterId: findUserId(context?.users, fields.reporterDisplayName),
      };
    }
    case 'epic': {
      const fields = response.fields as ParsedEpicFields;
      return {
        name: fields.name,
        description: fields.description,
      };
    }
    case 'sprint': {
      const fields = response.fields as ParsedSprintFields;
      const duration = fields.duration ?? 2;
      const values: Record<string, unknown> = {
        name: fields.name,
        duration,
        goals: fields.goals,
      };
      if (duration === 0 && fields.startDate && fields.endDate) {
        values.dates = [dayjs(fields.startDate), dayjs(fields.endDate)];
      } else if (fields.startDate) {
        values.startDate = dayjs(fields.startDate);
      }
      return values;
    }
    default:
      return {};
  }
}
