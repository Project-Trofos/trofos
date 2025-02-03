import OpenAI from 'openai';
import { UserGuideEmbedding } from '../../prisma_pgvector/generated/pgvector_client';
import prismaPgvector from '../models/prismaPgvectorClient';
import pgvector from 'pgvector';
import { UserGuideQueryResponse } from './types/ai.service.types';

const processUserGuideQuery = async (query: string, user: string): Promise<UserGuideQueryResponse> => {
  try {
    const embeddedQuery = await embedUserGuideQuery(query, user);
    const similarRecord = await performUserGuideSimilaritySearch(embeddedQuery);
    if (!similarRecord) {
      throw new Error('No similar record found.');
    }
    const answer = await askGptQueryWithContext(query, similarRecord, user);
    return {
      answer,
      links: [`https://project-trofos.github.io/trofos${similarRecord.endpoint}`]
    };
  } catch (error) {
    console.error(`Error processing user query: ${error}`);
    return {
      answer: 'Sorry, I encountered an issue while processing your query.',
      links: []
    };
  }
};

const getOpenAiClient = (): OpenAI => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

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
}

const performUserGuideSimilaritySearch = async (embeddedQuery: Array<Number>): Promise<UserGuideEmbedding | null> => {
  if (!embeddedQuery || embeddedQuery.length === 0) {
    return null;
  }

  try {
    const pgVectorEmbedding = pgvector.toSql(embeddedQuery);
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

    if (!similarRecords || similarRecords.length === 0) {
      console.warn('No matching records found for query.');
      return null;
    }
    return similarRecords[0];
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error querying the database: ${err.message || error}`);
    return null;
  }
};

const askGptQueryWithContext = async (query: string, context: UserGuideEmbedding, user: string): Promise<string> => {
  try { 
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
    const response = chatCompletion.choices[0].message.content ?
      chatCompletion.choices[0].message.content: '';
    return response;
  } catch (error) {
    console.error(`Error generating GPT response: ${error}`);
    return 'I’m currently unable to answer your query. Please try again later.';
  }
};

export {
  processUserGuideQuery,
};
