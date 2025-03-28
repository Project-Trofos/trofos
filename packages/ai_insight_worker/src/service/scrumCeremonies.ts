import { Sprint } from "@prisma/client";
import prisma from "../models/prismaClient";
import { generateScrumCeremoniesInsights } from "../insights/scrumCeremoniesInsights";

async function handleGenerateScrumCeremoniesInsights(sprint: Sprint, user: string): Promise<boolean> {
  const sprintId = sprint.id;
  const projectId = sprint.project_id
  try {
    const category = "Agile ceremonies";
    const insight = await generateScrumCeremoniesInsights(sprint , user);
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

export { handleGenerateScrumCeremoniesInsights };
