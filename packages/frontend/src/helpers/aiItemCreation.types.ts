export type WorkItemType = 'backlog' | 'epic' | 'sprint';

export type WorkItemContext = {
  sprints?: { id: number; name: string }[];
  epics?: { id: number; name: string }[];
  users?: { id: number; displayName: string; email: string }[];
};

export type ParsedBacklogFields = {
  summary: string;
  type?: 'story' | 'task' | 'bug';
  description?: string;
  priority?: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  points?: number;
  sprintName?: string;
  epicName?: string;
  assigneeDisplayName?: string;
  reporterDisplayName?: string;
};

export type ParsedEpicFields = {
  name: string;
  description?: string;
};

export type ParsedSprintFields = {
  name: string;
  duration?: number;
  goals?: string;
  startDate?: string;
  endDate?: string;
};

export type ParseWorkItemResponse = {
  itemType: WorkItemType;
  fields: ParsedBacklogFields | ParsedEpicFields | ParsedSprintFields;
};
