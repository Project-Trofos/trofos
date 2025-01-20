import OpenAI from 'openai';
import { UserGuideEmbedding } from '../../prisma_pgvector/generated/pgvector_client';
import prismaPgvector from '../models/prismaPgvectorClient';
import pgvector from 'pgvector';

const processUserGuideQuery = async (query: string, user: string): Promise<string> => {
  const embeddedQuery = await embedUserGuideQuery(query, user);
  const similarRecord = await performUserGuideSimilaritySearch(embeddedQuery);
  return askGptQueryWithContext(query, similarRecord, user);
}

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
    SELECT
    uge.id,
    uge.section_title,
    uge.created_at,
    uge.content,
    uge.endpoint
    FROM "UserGuideEmbedding" uge 
    ORDER BY uge.embedding <-> ${pgVectorEmbedding}::vector
    LIMIT 5`;
  console.log(similarRecords[0]);
  return similarRecords[0];
};

const askGptQueryWithContext = async (query: string, context: UserGuideEmbedding, user: string): Promise<string> => {
  const openai = getOpenAiClient();
  // TODO- for now just have developer role msg + user role msg. Next time maybe send previous message for continuous convo
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        "role": "developer",
        "content": [
          {
            "type": "text",
            "text": `
              You are a helpful assistant in a RAG that answers user queries on our agile project management application. Strictly only answer questions regarding our project management application, according to the following context. This is additional context for the user query: ${context.content}
            `
          }
        ]
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": query
          }
        ]
      }
    ],
    model: 'gpt-4o-mini',
    user: user,
  });
  console.log(chatCompletion.choices[0].message);
  const response = chatCompletion.choices[0].message.content ?
    chatCompletion.choices[0].message.content + `\nSource: https://project-trofos.github.io/trofos${context.endpoint}`: '';
  return response;
};

export {
  processUserGuideQuery,
};
