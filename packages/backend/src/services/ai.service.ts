import OpenAI from 'openai';
import { UserGuideEmbedding } from '@trofos-nus/common/src/generated/pgvector_client';
import prismaPgvector from '../models/prismaPgvectorClient';
import pgvector from 'pgvector';
import { CourseAutofillResponse, SprintAutofillResponse, UserGuideQueryResponse } from './types/ai.service.types';
import { redis } from './aiInsight.service';

const COPILOT_CHAT_HISTORY_KEY_PREFIX = 'copilot_chat_history_';
const EMBEDDING_SIMILARITY_THRESHOLD = 1.15;

type RedisChatHistoryEntry = {
  role: 'user' | 'assistant';
  content: string;
  hasRelevantContext?: boolean;
};

const getChatHistory = async (user: string): Promise<[RedisChatHistoryEntry]> => {
  const historyJson = await redis.get(COPILOT_CHAT_HISTORY_KEY_PREFIX + user);
  return historyJson ? JSON.parse(historyJson) : [];
};

const pushNewChatMessage = async (
  user: string,
  query: string,
  response: string,
  hasRelevantContext: boolean,
): Promise<void> => {
  const history = await getChatHistory(user);
  history.push({ role: 'user', content: query });
  history.push({ role: 'assistant', content: response, hasRelevantContext: hasRelevantContext });
  if (history.length > 8) {
    history.shift();
  }
  await redis.set(COPILOT_CHAT_HISTORY_KEY_PREFIX + user, JSON.stringify(history));
  await redis.expire(COPILOT_CHAT_HISTORY_KEY_PREFIX + user, 30 * 60); // memory persists for 30 minutes
};

const processUserGuideQuery = async (
  query: string,
  user: string,
  isEnableMemory: boolean,
): Promise<UserGuideQueryResponse> => {
  try {
    const embeddedQuery = await embedUserGuideQuery(query, user);
    const similarRecords = (await performUserGuideSimilaritySearch(embeddedQuery)) || [];
    // If memory is enabled, allow query with no similar record IF there is a chat history that is relevant
    const history = isEnableMemory ? await getChatHistory(user) : [];
    const hasRelevantContext = history.some((entry) => entry.hasRelevantContext);

    if (similarRecords.length === 0 && !hasRelevantContext) {
      throw new Error('No relevant answers found for the query');
    }
    const answer = await askGptQueryWithContext(query, similarRecords, user, history, isEnableMemory);
    return {
      answer,
      links: similarRecords.map((record) => `https://project-trofos.github.io/trofos${record.endpoint}`),
    };
  } catch (error) {
    console.error(`Error processing user query: ${error}`);
    return {
      answer: `Sorry, I encountered an issue while processing your query: ${error}`,
      links: [],
    };
  }
};

const getOpenAiClient = (): OpenAI => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

const embedUserGuideQuery = async (query: string, user: string): Promise<Array<Number>> => {
  try {
    const openai = getOpenAiClient();
    const res = await openai.embeddings.create({
      input: query,
      model: 'text-embedding-3-small',
      user: user,
      dimensions: 1536,
    });
    if (!res.data || res.data.length === 0) {
      throw new Error('OpenAI embedding failed: No embedding returned.');
    }
    return res.data[0].embedding;
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error generating embedding: ${err.message || error}`);
    return [];
  }
};

const performUserGuideSimilaritySearch = async (embeddedQuery: Array<Number>): Promise<UserGuideEmbedding[] | null> => {
  if (!embeddedQuery || embeddedQuery.length === 0) {
    return null;
  }

  try {
    const pgVectorEmbedding = pgvector.toSql(embeddedQuery);
    const similarRecords = await prismaPgvector.$queryRaw<(UserGuideEmbedding & { similarity: number })[]>`
      SELECT
        uge.id,
        uge.section_title,
        uge.created_at,
        uge.content,
        uge.endpoint,
        (uge.embedding <-> ${pgVectorEmbedding}::vector) AS similarity
      FROM "UserGuideEmbedding" uge
      WHERE uge.embedding <-> ${pgVectorEmbedding}::vector < ${EMBEDDING_SIMILARITY_THRESHOLD}
      ORDER BY similarity
      LIMIT 3`;

    if (!similarRecords || similarRecords.length === 0) {
      console.warn('No matching records found for query.');
      return null;
    }
    const results: UserGuideEmbedding[] = similarRecords.map(({ similarity, ...record }) => record);
    return results;
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error querying the database: ${err.message || error}`);
    return null;
  }
};

const askGptQueryWithContext = async (
  query: string,
  topSimilarResults: UserGuideEmbedding[],
  user: string,
  history: RedisChatHistoryEntry[],
  isEnableMemory: boolean,
): Promise<string> => {
  try {
    const openai = getOpenAiClient();
    const context =
      topSimilarResults.length > 0
        ? topSimilarResults.map((result) => result.section_title + ': ' + result.content).join('\n')
        : 'No context. Use previous chat history or do not answer if the question is irrelevant.';
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: 'developer',
          content: [
            {
              type: 'text',
              text: `
                You are a helpful assistant in a RAG that answers user queries on our agile project management application. Strictly only answer questions regarding our project management application, according to the following context. This is additional context for the user query: ${context}
              `,
            },
          ],
        },
        ...history,
        {
          role: 'user',
          content: query,
        },
      ],
      model: 'gpt-4o-mini',
      user: user,
    });
    const response = chatCompletion.choices[0].message.content ? chatCompletion.choices[0].message.content : '';
    if (isEnableMemory) {
      await pushNewChatMessage(user, query, response, topSimilarResults.length > 0);
    }
    return response;
  } catch (error) {
    console.error(`Error generating GPT response: ${error}`);
    return 'I’m currently unable to answer your query. Please try again later.';
  }
};

const AI_UNAVAILABLE_MESSAGE = 'AI assist is currently unavailable. Please fill in the form manually.';

// Calls the model in JSON mode; any failure is logged and replaced with a generic message so internals never reach the user
const extractJson = async (instructions: string, text: string, user: string): Promise<unknown> => {
  try {
    const openai = getOpenAiClient();
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'developer', content: instructions },
        { role: 'user', content: text },
      ],
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      user: user,
    });
    const content = chatCompletion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }
    return JSON.parse(content);
  } catch (error) {
    console.error(`AI autofill failed: ${error}`);
    throw new Error(AI_UNAVAILABLE_MESSAGE);
  }
};

// Accepts real numbers and digit-only strings; rejects values like `true` or `[2]` that Number() would coerce
const toInteger = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value.trim());
  return undefined;
};

const toTrimmedString = (value: unknown, maxLength: number): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : undefined;
};

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

// Returns the date unchanged as YYYY-MM-DD so the client can read it as a local date without timezone shifts
const toDateOnly = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return undefined;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return isRealDate ? value : undefined;
};

const toUtcDate = (dateOnly: string): Date => {
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Date-only arithmetic in UTC so daylight-saving changes and the server's timezone can't shift the result
const addDays = (dateOnly: string, days: number): string =>
  new Date(toUtcDate(dateOnly).getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);

const daysBetween = (from: string, to: string): number =>
  Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / MS_PER_DAY);

const formatDateOnly = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CALENDAR_DAYS_AHEAD = 28;

// The model is unreliable at weekday arithmetic, so it is given a lookup table of upcoming dates instead
const buildUpcomingCalendar = (today: Date): string =>
  Array.from({ length: CALENDAR_DAYS_AHEAD + 1 }, (_, offset) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    return `${WEEKDAYS[date.getDay()]} ${formatDateOnly(date)}${offset === 0 ? ' (today)' : ''}`;
  }).join('\n');

const COURSE_NAME_PATTERN = /^[a-zA-Z0-9-\s]*$/;
const COURSE_NAME_MAX_LENGTH = 64;
const MIN_COURSE_YEAR = 1900;
const MAX_COURSE_YEAR = 2200;

// Keeps only the values that pass the same rules as the course creation form; anything else is left blank
const sanitizeCourseAutofill = (raw: unknown): CourseAutofillResponse => {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const result: CourseAutofillResponse = {};

  const name = toTrimmedString(data.courseName, COURSE_NAME_MAX_LENGTH);
  if (name !== undefined && COURSE_NAME_PATTERN.test(name)) {
    result.courseName = name;
  }
  if (typeof data.courseCode === 'string' && data.courseCode.trim().length > 0) {
    result.courseCode = data.courseCode.trim();
  }
  const year = toInteger(data.courseYear);
  if (year !== undefined && year >= MIN_COURSE_YEAR && year <= MAX_COURSE_YEAR) {
    result.courseYear = year;
  }
  const sem = toInteger(data.courseSem);
  if (sem === 1 || sem === 2) {
    result.courseSem = sem;
  }
  return result;
};

const extractCourseDetails = async (text: string, user: string): Promise<CourseAutofillResponse> => {
  const instructions = `
    You extract course details from user text for a course creation form. Respond with a JSON object with exactly these keys:
    "courseName" (string), "courseCode" (string), "courseYear" (integer, the academic year's starting year, e.g. 2025 for AY2025/2026),
    "courseSem" (integer, 1 or 2). Use null for any value that is not explicitly stated in the text. Never guess or infer missing values.
  `;
  return sanitizeCourseAutofill(await extractJson(instructions, text, user));
};

const SPRINT_NAME_MAX_LENGTH = 128;
const SPRINT_GOALS_MAX_LENGTH = 2000;
const MAX_PRESET_SPRINT_WEEKS = 4;
const MAX_SPRINT_WEEKS = 12;
const MAX_SPRINT_LENGTH_DAYS = 84;
const CUSTOM_DURATION = 0;

const toIntegerInRange = (value: unknown, min: number, max: number): number | undefined => {
  const integer = toInteger(value);
  return integer !== undefined && integer >= min && integer <= max ? integer : undefined;
};

type SprintLength = { duration: number; endDate?: string };

// Resolves the sprint length from the text. A length given in days or weeks is always calculated here, even if the
// model also returned an end date, because the model's own date arithmetic is unreliable. A named end date
// ("to Friday") is only used when the text gives no length.
const resolveSprintLength = (startDate: string, data: Record<string, unknown>): SprintLength | undefined => {
  const lengthInDays = toIntegerInRange(data.lengthInDays, 1, MAX_SPRINT_LENGTH_DAYS);
  if (lengthInDays !== undefined) {
    // The start date counts as day one, so "5 days from 2 Oct" ends on 6 Oct
    return { duration: CUSTOM_DURATION, endDate: addDays(startDate, lengthInDays - 1) };
  }
  const weeks = toIntegerInRange(data.weeks, 1, MAX_SPRINT_WEEKS);
  if (weeks !== undefined) {
    // More than 4 weeks becomes a custom range with the same rule as the form's week options: start + 7 x weeks
    return weeks <= MAX_PRESET_SPRINT_WEEKS
      ? { duration: weeks }
      : { duration: CUSTOM_DURATION, endDate: addDays(startDate, weeks * 7) };
  }
  const endDate = toDateOnly(data.endDate);
  if (endDate !== undefined && daysBetween(startDate, endDate) >= 0) {
    return { duration: CUSTOM_DURATION, endDate };
  }
  return undefined;
};

// Keeps only the values that pass the same rules as the sprint creation form; anything else is left blank
const sanitizeSprintAutofill = (raw: unknown): SprintAutofillResponse => {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const result: SprintAutofillResponse = {};

  const name = toTrimmedString(data.name, SPRINT_NAME_MAX_LENGTH);
  if (name !== undefined) {
    result.name = name;
  }

  const startDate = toDateOnly(data.startDate);
  if (startDate !== undefined) {
    result.startDate = startDate;
    const length = resolveSprintLength(startDate, data);
    if (length?.endDate === undefined) {
      if (length !== undefined) result.duration = length.duration;
    } else if (daysBetween(startDate, length.endDate) <= MAX_SPRINT_LENGTH_DAYS) {
      result.duration = length.duration;
      result.endDate = length.endDate;
    }
  } else {
    const presetWeeks = toIntegerInRange(data.weeks, 1, MAX_PRESET_SPRINT_WEEKS);
    if (presetWeeks !== undefined) result.duration = presetWeeks;
  }

  const goals = toTrimmedString(data.goals, SPRINT_GOALS_MAX_LENGTH);
  if (goals !== undefined) {
    result.goals = goals;
  }
  return result;
};

const extractSprintDetails = async (
  text: string,
  user: string,
  today: Date = new Date(),
): Promise<SprintAutofillResponse> => {
  const instructions = `
    You extract sprint details from user text for a sprint creation form. Today is ${WEEKDAYS[today.getDay()]}, ${formatDateOnly(today)}.
    Respond with a JSON object with exactly these keys:
    "name" (string, the sprint's name or title),
    "weeks" (integer, the sprint length in whole weeks, only if the length is given in weeks),
    "lengthInDays" (integer, the sprint length in days, only if the length is given in days),
    "startDate" (string in YYYY-MM-DD format, the sprint's first day; use null if it cannot be determined),
    "endDate" (string in YYYY-MM-DD format, only if the text names the sprint's last day, e.g. "to Friday" or "until 20 Oct";
    a weekday such as "to Friday" means the first such weekday on or after the start date),
    "goals" (string, only what the sprint aims to achieve).
    Never put the sprint's name, length or dates in goals; use null for goals if none are stated.
    Use null for any value that is not explicitly stated in the text. Never guess or infer missing values.

    Calendar of upcoming dates:
    ${buildUpcomingCalendar(today)}

    For a relative date (such as "tomorrow", "next Monday", "this Friday" or "to Friday") or a date without a year,
    copy the matching date from the calendar above instead of calculating it. "Next <weekday>" means the first
    such weekday after today. Only calculate a date yourself if it falls outside the calendar.
    Never calculate an end date from a length; return the length in "weeks" or "lengthInDays" instead.
  `;
  return sanitizeSprintAutofill(await extractJson(instructions, text, user));
};

export {
  AI_UNAVAILABLE_MESSAGE,
  processUserGuideQuery,
  extractCourseDetails,
  sanitizeCourseAutofill,
  extractSprintDetails,
  sanitizeSprintAutofill,
};
