import OpenAI from 'openai';
import { UserGuideEmbedding } from '@trofos-nus/common/src/generated/pgvector_client';
import prismaPgvector from '../models/prismaPgvectorClient';
import pgvector from 'pgvector';
import { UserGuideQueryResponse } from './types/ai.service.types';
import { redis } from './aiInsight.service';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';

const COPILOT_CHAT_HISTORY_KEY_PREFIX = 'copilot_chat_history_';
const EMBEDDING_SIMILARITY_THRESHOLD = 1.15;

type RedisChatHistoryEntry = {
  role: 'user' | 'assistant';
  content: string;
  hasRelevantContext?: boolean;
};

const backlogsFormat = z.array(
  z.object({
    summary: z.string().min(1).max(255),
    description: z.string().min(1).max(2000),
    type: z.enum(['story', 'bug', 'task']),
    priority: z.enum(['very_high', 'high', 'medium', 'low', 'very_low']),
    points: z.number().min(1),
  }),
);

export type PartialBacklogs = z.infer<typeof backlogsFormat>;

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

const generateBacklogsItems = async (query: string): Promise<PartialBacklogs> => {
  try {
    const openai = getOpenAiClient();
    const response = await openai.responses.parse({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'developer',
          content: `You are an Agile product owner. Given the following prompt for the sprint, expand it into multiple backlog items with clear, actionable summary and descriptions. Each item should include a category, priority, and story points.
            - Feature: new functionality visible to users
            - Bug: issues/errors that break expected functionality
            - Task: technical chores not visible to users
            Priority ranges from very_high, high, medium, low, very_low, and 1 story point should be about 4 hours of work.

            Strictly output the result as JSON in the following format:
            [
              {
                "summary": "Short actionable title",
                "description": "Detailed description of backlog item",
                "category": "Feature | Bug | Task",
                "priority": "very_high | high | medium | low | very_low",
                "points": number
              }
            ]`
        },
        { role: 'user', content: query },
      ],
      text: {
        format: zodTextFormat(z.object({backlogs: backlogsFormat}), 'backlogs'),
      },
    });
    console.log(response.output_parsed);
    return response.output_parsed?.backlogs ?? [];
  } catch (error) {
    console.error(`Error generating GPT response: ${error}`);
    return [];
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
    const chatCompletion = await openai.responses.parse({
      input: [
        {
          role: 'developer',
          content: `You are an Agile product owner. Given the following prompt for the sprint, expand it into multiple backlog items with clear, actionable titles and descriptions. Each item should include a category, priority, and story points.
            - Feature: new functionality visible to users
            - Bug: issues/errors that break expected functionality
            - Task: technical chores not visible to users
            Priority ranges from very_high, high, medium, low, very_low, and 1 story point should be about 4 hours of work.

            Strictly output the result as JSON in the following format:
            [
              {
                "title": "Short actionable title",
                "description": "Detailed description of backlog item",
                "category": "Feature | Bug | Task",
                "priority": "very_high | high | medium | low | very_low",
                "story_points": number
              }
            ]`
        },
        {
          role: 'user',
          content: query,
        },
      ],
      model: 'gpt-4o-mini',
      user: user,
      text: {
        format: zodTextFormat(backlogsFormat, 'backlogs'),
      },
    });
    console.log(chatCompletion.output_parsed);
    const response = String(chatCompletion.output_parsed) ?? '';
    if (isEnableMemory) {
      await pushNewChatMessage(user, query, response, topSimilarResults.length > 0);
    }
    return response;
  } catch (error) {
    console.error(`Error generating GPT response: ${error}`);
    return 'I’m currently unable to answer your query. Please try again later.';
  }
};

export { processUserGuideQuery, generateBacklogsItems };
