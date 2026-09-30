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

const formatDateOnly = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

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
const MIN_SPRINT_DURATION_WEEKS = 1;
const MAX_SPRINT_DURATION_WEEKS = 4;

// Keeps only the values that pass the same rules as the sprint creation form; anything else is left blank
const sanitizeSprintAutofill = (raw: unknown): SprintAutofillResponse => {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const result: SprintAutofillResponse = {};

  const name = toTrimmedString(data.name, SPRINT_NAME_MAX_LENGTH);
  if (name !== undefined) {
    result.name = name;
  }
  const duration = toInteger(data.duration);
  if (duration !== undefined && duration >= MIN_SPRINT_DURATION_WEEKS && duration <= MAX_SPRINT_DURATION_WEEKS) {
    result.duration = duration;
  }
  const startDate = toDateOnly(data.startDate);
  if (startDate !== undefined) {
    result.startDate = startDate;
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
    You extract sprint details from user text for a sprint creation form. Today's date is ${formatDateOnly(today)}.
    Respond with a JSON object with exactly these keys:
    "name" (string, the sprint's name or title), "duration" (integer, 1 to 4, the sprint length in whole weeks;
    only set this if a whole number of weeks from 1 to 4 is explicitly stated or clearly implied - if the text
    describes a custom or irregular date range instead, use null), "startDate" (string in YYYY-MM-DD format, the
    sprint's start date; resolve relative dates such as "next Monday" and dates without a year against today's date,
    choosing the nearest such date that is not in the past; use null if the start date cannot be determined),
    "goals" (string, a short free-text description of the sprint's goals).
    Use null for any value that is not explicitly stated in the text. Never guess or infer missing values.
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
