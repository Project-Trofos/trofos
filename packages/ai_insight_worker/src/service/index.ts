import { handleGenerateContributionInsight } from "./contribution";

async function handleAllInsights(projectId: number, sprintId: number, user: string): Promise<boolean> {
  // Generate and upsert all insights
  const contributionInsightSuccess = await handleGenerateContributionInsight(projectId, sprintId, user);
  return contributionInsightSuccess;
}

export { handleAllInsights };
