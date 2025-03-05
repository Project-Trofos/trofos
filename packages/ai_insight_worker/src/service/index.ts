import { Sprint } from "@prisma/client";
import prisma from "../models/prismaClient";
import { handleGenerateBacklogInsights } from "./backlog";
import { handleGenerateContributionInsight } from "./contribution";

async function handleAllInsights(projectId: number, sprintId: number, user: string): Promise<boolean> {
  // Generate and upsert all insights
  const sprint: Sprint = await prisma.sprint.findUniqueOrThrow({
    where: {
      id: sprintId,
    },
  });
  if (sprint.project_id !== projectId) {
    throw new Error(`Sprint with id ${sprintId} does not belong to project with id ${projectId}`);
  }

  const contributionInsightSuccess = await handleGenerateContributionInsight(sprint, user);
  const backlogInsightSuccess = await handleGenerateBacklogInsights(sprint, user);
  return contributionInsightSuccess && backlogInsightSuccess;
}

export { handleAllInsights };
