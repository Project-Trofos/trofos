import { StatusCodes } from 'http-status-codes';
import prisma from '../models/prismaClient';

type UserGuideRecommendation = {
  section_title: string;
  endpoint: string;
};

const gettingStartedSection: UserGuideRecommendation[] = [
  {
    section_title: 'Getting Started',
    endpoint: 'https://project-trofos.github.io/trofos/guide/quick-start',
  },
];

const excludePaths = ['/api/account', '/api/settings', '/api/ai/recommendUserGuide'];

/**
 * Generate personalized recommendations for a user
 */
async function generateRecommendations(user_id: number, user_role_id: number): Promise<UserGuideRecommendation[]> {
  return prisma.$transaction(async (tx) => {
    // Calculate timeframe once
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Common filters for fetching api usages
    const commonFilters = {
      timestamp: {
        gte: oneWeekAgo,
      },
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
    };

    // Get all api endpoints
    const allApiEndpoints = await prisma.apiMapping.findMany();

    // Create a map for quick lookups of API documentation
    const apiDocsMap = new Map(
      allApiEndpoints.map((endpoint) => [
        `${endpoint.method}:${endpoint.path}`,
        {
          section: endpoint.section_title,
          docUrl: endpoint.endpoint,
        },
      ]),
    );

    const [globalApiUsage, userApiUsage] = await Promise.all([
      tx.apiUsage.groupBy({
        by: ['method', 'path'],
        where: {
          user: {
            basicRoles: {
              some: {
                role_id: user_role_id,
              },
            },
          },
          NOT: {
            user_id,
          },
          ...commonFilters,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),

      tx.apiUsage.groupBy({
        by: ['method', 'path'],
        where: {
          user_id,
          ...commonFilters,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // Find APIs the user hasn't used or has used infrequently
    const userUsagePaths = new Set(userApiUsage.map((u) => `${u.method}:${u.path}`));

    // Build unique recommendations in a single pass
    const uniqueKeys = new Set();
    const recommendations = globalApiUsage
      .map((stats) => {
        const key = `${stats.method}:${stats.path}`;
        const docInfo = apiDocsMap.get(key) || { section: null, docUrl: null };

        return {
          key,
          usageCount: stats._count.id,
          documentationSection: docInfo.section,
          documentationUrl: docInfo.docUrl,
        };
      })
      .filter(
        (stat) =>
          // Filter for features the user hasn't tried yet but others have
          !userUsagePaths.has(stat.key) &&
          stat.usageCount > 0 &&
          stat.documentationSection !== null &&
          stat.documentationUrl !== null,
      )
      .sort((a, b) => a.usageCount - b.usageCount) // Prioritize least used APIs
      .reduce((unique: UserGuideRecommendation[], stat) => {
        const recommendation = {
          section_title: stat.documentationSection!,
          endpoint: `https://project-trofos.github.io/trofos${stat.documentationUrl!}`,
        };

        const uniqueKey = `${recommendation.section_title}::${recommendation.endpoint}`;

        if (!uniqueKeys.has(uniqueKey)) {
          uniqueKeys.add(uniqueKey);
          unique.push(recommendation);
        }

        return unique;
      }, []);

    return recommendations.concat(gettingStartedSection).slice(0, 5);
  });
}

export default { generateRecommendations };
