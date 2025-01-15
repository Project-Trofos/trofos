import OpenAI from 'openai';
import { UserGuideEmbedding } from '../../prisma_pgvector/generated/pgvector_client';
import prismaPgvector from '../models/prismaPgvectorClient';
import pgvector from 'pgvector';

const getOpenAiClient = (): OpenAI => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

const embedUserGuideQuery = async (query: string, user: string): Promise<Array<Number>> => {
  const openai = getOpenAiClient();
  const res = await openai.embeddings.create({
    input: query,
    model: 'text-embedding-3-small',
    user: user,
    dimensions: 1536,
  });
  return res.data[0].embedding;
}

const performUserGuideSimilaritySearch = async (embeddedQuery: Array<Number>): Promise<UserGuideEmbedding> => {
  const pgVectorEmbedding = pgvector.toSql(embeddedQuery)
  const similarRecords = await prismaPgvector.$queryRaw<UserGuideEmbedding[]>`
    SELECT *
    FROM "UserGuideEmbedding" uge 
    ORDER BY uge.embedding <-> ${pgVectorEmbedding}::vector
    LIMIT 5`;
  return similarRecords[0];
};

const askGptQueryWithContext = async (query: string, context: string, user: string): Promise<string> => {
  const openai = getOpenAiClient();
  // TODO- for now just have developer role msg + user role msg. Next time maybe send previous message for continuous convo
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-4o',
  });
};