import OpenAI from 'openai';
import {
  ParseWorkItemRequest,
  ParseWorkItemResponse,
  ParsedBacklogFields,
  ParsedEpicFields,
  ParsedSprintFields,
  WorkItemType,
} from './types/aiItemCreation.service.types';
import { BadRequestError } from '../helpers/error';

const getOpenAiClient = (): OpenAI =>
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const COMMON_PROMPT = `
                          You are an information extraction engine for an Agile project management system.

                          Your task is to extract structured fields from the user's request.

                          Rules:
                          - Return only valid JSON matching the schema.
                          - Do not return markdown.
                          - Do not return explanations.
                          - Do not invent information.
                          - Omit fields that are not explicitly stated or cannot be confidently inferred.
                          - Do not return null values.
                          - Do not return empty strings.
                          - Do not add fields that are not defined in the schema.
                          - If matching users, epics, or sprints, use only values provided in the context.
                          `;

const TASK_INSTRUCTIONS: Record<WorkItemType, string> = {
  backlog: `Extract a backlog item.

            Field rules:
            - summary: concise title.
            - type:
              - story = user-facing functionality
              - task = technical or operational work
              - bug = defect or issue
            - points = numeric story points.
            - sprintName must match an available sprint.
            - epicName must match an available epic.
            - assigneeDisplayName must match an available user.
            - reporterDisplayName must match an available user.
            `,

  epic: `Extract an epic.

        Field rules:
        - name = epic title.
        - description = epic details.
`,

  sprint: `Extract a sprint.

          Field rules:
          - duration:
            0 = custom
            1 = 1 week
            2 = 2 weeks
            3 = 3 weeks
            4 = 4 weeks
          - If unclear, default duration to 2.
          - Dates must be YYYY-MM-DD.
          - If explicit start and end dates are supplied, duration should be 0.
          `,
};
// const PROMPTS: Record<WorkItemType, string> = {
//     backlog: `You extract backlog (user story/task/bug) fields from natural language for an agile project tool.
//               Return ONLY a JSON object with these keys:
//               - summary (required string): short title
//               - type (required): one of "story", "task", "bug"
//               - description (optional string)
//               - priority (optional): one of "very_high", "high", "medium", "low", "very_low"
//               - points (optional number, story points)
//               - sprintName (optional string): pick the closest name from provided sprints if mentioned
//               - epicName (optional string): pick the closest name from provided epics if mentioned
//               - assigneeDisplayName (optional string): match a user display name from context if mentioned
//               - reporterDisplayName (optional string): match a user display name from context if mentioned`,
//                 epic: `You extract epic fields from natural language for an agile project tool.
//               Return ONLY a JSON object with these keys:
//               - name (required string): epic title
//               - description (optional string): epic description`,
//                 sprint: `You extract sprint fields from natural language for an agile project tool.
//               Return ONLY a JSON object with these keys:
//               - name (required string): sprint name
//               - duration (optional number): 0=custom, 1=1 week, 2=2 weeks, 3=3 weeks, 4=4 weeks. Default to 2 if unclear.
//               - goals (optional string): sprint goals
//               - startDate (optional string): ISO 8601 date (YYYY-MM-DD) for sprint start if mentioned
//               - endDate (optional string): ISO 8601 date (YYYY-MM-DD) for sprint end if custom duration or end date mentioned`,
//             };

function buildContextBlock(context: ParseWorkItemRequest['context']): string {
  if (!context) {
    return '';
  }
  const parts: string[] = [];
  if (context.sprints?.length) {
    parts.push(`Sprints: ${context.sprints.map((s) => `"${s.name}" (id ${s.id})`).join(', ')}`);
  }
  if (context.epics?.length) {
    parts.push(`Epics: ${context.epics.map((e) => `"${e.name}" (id ${e.id})`).join(', ')}`);
  }
  if (context.users?.length) {
    parts.push(
      `Users: ${context.users.map((u) => `"${u.displayName}" <${u.email}> (id ${u.id})`).join(', ')}`,
    );
  }
  return parts.length ? `\nProject context:\n${parts.join('\n')}` : '';
}

function parseJsonContent(content: string): Record<string, unknown> {
  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new BadRequestError('AI did not return valid JSON');
  }
  try {
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    throw new BadRequestError('AI returned malformed JSON');
  }
}

function validateBacklogFields(raw: Record<string, unknown>): ParsedBacklogFields {
  if (typeof raw.summary !== 'string' || !raw.summary.trim()) {
    throw new BadRequestError('AI response missing required field: summary');
  }
  const type = raw.type;
  if (type !== undefined && type !== 'story' && type !== 'task' && type !== 'bug') {
    throw new BadRequestError('AI response has invalid backlog type');
  }
  return {
    summary: raw.summary.trim(),
    type: (type as ParsedBacklogFields['type']) ?? 'story',
    description: typeof raw.description === 'string' ? raw.description : undefined,
    priority: raw.priority as ParsedBacklogFields['priority'],
    points: typeof raw.points === 'number' ? raw.points : undefined,
    sprintName: typeof raw.sprintName === 'string' ? raw.sprintName : undefined,
    epicName: typeof raw.epicName === 'string' ? raw.epicName : undefined,
    assigneeDisplayName: typeof raw.assigneeDisplayName === 'string' ? raw.assigneeDisplayName : undefined,
    reporterDisplayName: typeof raw.reporterDisplayName === 'string' ? raw.reporterDisplayName : undefined,
  };
}

function validateEpicFields(raw: Record<string, unknown>): ParsedEpicFields {
  if (typeof raw.name !== 'string' || !raw.name.trim()) {
    throw new BadRequestError('AI response missing required field: name');
  }
  return {
    name: raw.name.trim(),
    description: typeof raw.description === 'string' ? raw.description : undefined,
  };
}

function validateSprintFields(raw: Record<string, unknown>): ParsedSprintFields {
  if (typeof raw.name !== 'string' || !raw.name.trim()) {
    throw new BadRequestError('AI response missing required field: name');
  }
  const duration = raw.duration;
  if (duration !== undefined && (typeof duration !== 'number' || duration < 0 || duration > 4)) {
    throw new BadRequestError('AI response has invalid sprint duration');
  }
  return {
    name: raw.name.trim(),
    duration: typeof duration === 'number' ? duration : 2,
    goals: typeof raw.goals === 'string' ? raw.goals : undefined,
    startDate: typeof raw.startDate === 'string' ? raw.startDate : undefined,
    endDate: typeof raw.endDate === 'string' ? raw.endDate : undefined,
  };
}
function buildResponseSchema(type: WorkItemType) {
  switch (type) {
    case 'backlog':
      return {
        type: 'json_schema',
        json_schema: {
          name: 'backlog_item',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              summary: { type: 'string' },
              type: {
                type: 'string',
                enum: ['story', 'task', 'bug'],
              },
              description: { type: 'string' },
              priority: {
                type: 'string',
                enum: [
                  'very_high',
                  'high',
                  'medium',
                  'low',
                  'very_low',
                ],
              },
              points: { type: 'number' },
              sprintName: { type: 'string' },
              epicName: { type: 'string' },
              assigneeDisplayName: { type: 'string' },
              reporterDisplayName: { type: 'string' },
            },
            required: ['summary', 'type'],
          },
        },
      };

    case 'epic':
      return {
        type: 'json_schema',
        json_schema: {
          name: 'epic',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
            },
            required: ['name'],
          },
        },
      };

    case 'sprint':
      return {
        type: 'json_schema',
        json_schema: {
          name: 'sprint',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              duration: {
                type: 'integer',
                enum: [0, 1, 2, 3, 4],
              },
              goals: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
            },
            required: ['name'],
          },
        },
      };
  }
}
async function parseWorkItemFromNaturalLanguage(
  request: ParseWorkItemRequest,
  userEmail: string,
): Promise<ParseWorkItemResponse> {
  const { itemType, message, context } = request;
  if (!message?.trim()) {
    throw new BadRequestError('message cannot be empty');
  }

  const openai = getOpenAiClient();
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-5.5-2026-04-23',
    user: userEmail,
    response_format:  buildResponseSchema(itemType),
    messages: [
      {
        role: 'system',
        content:  `
        ${COMMON_PROMPT}
        
        ${TASK_INSTRUCTIONS[itemType]}
        `
      },
      {
        role: 'user',
        content: `${message.trim()}${buildContextBlock(context)}`,
      },
    ],
  });

  const content = chatCompletion.choices[0]?.message?.content;
  if (!content) {
    throw new BadRequestError('AI returned an empty response');
  }

  const raw = parseJsonContent(content);

  switch (itemType) {
    case 'backlog':
      return { itemType, fields: validateBacklogFields(raw) };
    case 'epic':
      return { itemType, fields: validateEpicFields(raw) };
    case 'sprint':
      return { itemType, fields: validateSprintFields(raw) };
    default:
      throw new BadRequestError('Invalid item type');
  }
}

export { parseWorkItemFromNaturalLanguage };
