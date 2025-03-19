import { StatusCodes } from 'http-status-codes';
import prisma from '../models/prismaClient';
import { UserGuideEmbedding } from '@trofos-nus/common/src/generated/pgvector_client';
import { embedUserGuideQuery, performUserGuideSimilaritySearch } from './ai.service';

type Usage = {
  path: string;
  method: string;
  _count: { id: number };
};

type UserGuideRecommendation = {
  section_title: string;
  endpoint: string;
};

const gettingStartedSection = [
  {
    section_title: 'Getting Started',
    endpoint: 'https://project-trofos.github.io/trofos/guide/quick-start',
  },
];

async function getUserApiUsage(userId: number, limit: number = 5) {
  const now = new Date(Date.now());
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  const excludePaths = ['/account', '/settings', '/ai/recommendUserGuide'];

  return await prisma.apiUsage.groupBy({
    by: ['path', 'method'],
    where: {
      user_id: userId,
      timestamp: { gte: oneWeekAgo },
      response_code: StatusCodes.OK,
      AND: [
        {
          NOT: {
            OR: excludePaths.map((prefix) => ({
              path: {
                startsWith: prefix,
              },
            })),
          },
        },
      ],
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: limit,
  });
}

const parseUsagesIntoQuery = (user: string, usages: Usage[]) => {
  const queryArr: Array<String> = [];
  const contextString = `Here are the top 5 most common feature usages for ${user} from the past week.`;
  queryArr.push(contextString);

  usages.forEach((usage, idx) => {
    const usageString = `${idx + 1}. ${usage.method.toUpperCase()} ${usage.path} called ${usage._count.id} times`;
    queryArr.push(usageString);
  });

  return queryArr.join('\n');
};

async function recommendUserGuideSections(userId: number, user: string) {
  const usages = await getUserApiUsage(userId);

  if (!usages || usages.length === 0) {
    return gettingStartedSection;
  }

  const query = parseUsagesIntoQuery(user, usages);

  const embeddedQuery = await embedUserGuideQuery(query, user);
  const similarRecords = await performUserGuideSimilaritySearch(embeddedQuery);

  if (!similarRecords || similarRecords.length === 0) {
    return gettingStartedSection;
  }

  return similarRecords.map(
    (record: UserGuideEmbedding): UserGuideRecommendation => ({
      section_title: record.section_title,
      endpoint: `https://project-trofos.github.io/trofos${record.endpoint}`,
    }),
  );
}

export default { recommendUserGuideSections };
