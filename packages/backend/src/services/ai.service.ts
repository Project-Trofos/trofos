import OpenAI from 'openai';
import { UserGuideEmbedding } from '@trofos-nus/common/src/generated/pgvector_client';
import prismaPgvector from '../models/prismaPgvectorClient';
import pgvector from 'pgvector';
import { UserGuideQueryResponse } from './types/ai.service.types';

const EMBEDDING_SIMILARITY_THRESHOLD = 1.15;

const processUserGuideQuery = async (query: string, user: string): Promise<UserGuideQueryResponse> => {
  try {
    const embeddedQuery = await embedUserGuideQuery(query, user);
    const similarRecords = await performUserGuideSimilaritySearch(embeddedQuery);
    if (!similarRecords || similarRecords.length === 0) {
      throw new Error('No relevant answers found for the query');
    }
    const answer = await askGptQueryWithContext(query, similarRecords, user);
    return {
      answer,
      links: similarRecords.map((record) => `https://project-trofos.github.io/trofos${record.endpoint}`)
    };
  } catch (error) {
    console.error(`Error processing user query: ${error}`);
    return {
      answer: `Sorry, I encountered an issue while processing your query: ${error}`,
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

    console.log(similarRecords);

    if (!similarRecords || similarRecords.length === 0) {
      console.warn('No matching records found for query.');
      return null;
    }
    const results: UserGuideEmbedding[] = similarRecords.map(({similarity, ...record}) => record);
    return results;
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error querying the database: ${err.message || error}`);
    return null;
  }
};

const askGptQueryWithContext = async (query: string, topSimilarResults: UserGuideEmbedding[], user: string): Promise<string> => {
  try { 
    const openai = getOpenAiClient();
    // TODO- for now just have developer role msg + user role msg. Next time maybe send previous message for continuous convo
    const context = topSimilarResults.map((result) => result.section_title + ": " + result.content).join('\n');
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          "role": "developer",
          "content": [
            {
              "type": "text",
              "text": `
                You are a helpful assistant in a RAG that answers user queries on our agile project management application. Strictly only answer questions regarding our project management application, according to the following context. This is additional context for the user query: ${context}
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
