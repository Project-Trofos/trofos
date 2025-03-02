import { generateBacklogInsights } from "../insights/backlogInsights";
import prisma from "../models/prismaClient";

async function handleGenerateBacklogInsights(projectId: number, sprintId: number, user: string): Promise<boolean> {
  try {
    const category = "Backlog";
    const insight = await generateBacklogInsights(projectId, sprintId, user);
    // upsert the insight to the database
    await prisma.sprintInsight.upsert({
      where: {
        sprint_id_category: {
          sprint_id: sprintId,
          category: category,
        }
      },
      create: {
        sprint_id: sprintId,
        category: category,
        content: insight,
      },
      update: {
        content: insight,
      },
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export { handleGenerateBacklogInsights };
