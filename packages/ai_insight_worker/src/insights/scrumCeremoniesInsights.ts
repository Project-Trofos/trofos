
import { BacklogHistory, Retrospective, Sprint, StandUp, StandUpNote } from "@prisma/client";
import prisma from "../models/prismaClient";
import openAiClient from "../models/openAiClient";

async function generateScrumCeremoniesInsights(sprint1: Sprint, user: string): Promise<string> {
  const sprint: Sprint = await prisma.sprint.findUniqueOrThrow({
    where: {
      id: sprint1.id,
    },
  });
  // todo del
  
  const projectId = sprint.project_id;
  const sprintId = sprint.id;

  // Analyze sprint planning, stand ups and past 2 retrospectives (no sprint review feature in trofos so can't analyze)

  // 1. sprint planning - get the backlog histories of all backlogs in this sprint, for the point they first appeared
  // in this sprint -> see if most backlogs added at the start of sprint or throughout sprint
  const historyWhenFirstAppearInSprint: BacklogHistory[] = await prisma.$queryRaw`
    SELECT bh.*
    FROM "BacklogHistory" bh
    INNER JOIN (
      SELECT backlog_id, project_id, MIN(date) AS first_added_date
      FROM "BacklogHistory"
      WHERE sprint_id = ${sprintId} AND project_id = ${projectId}
      GROUP BY backlog_id, project_id
    ) first_entries
    ON bh.backlog_id = first_entries.backlog_id
    AND bh.date = first_entries.first_added_date
    AND bh.project_id = first_entries.project_id
    WHERE bh.sprint_id = ${sprintId} AND bh.project_id = ${projectId};
  `;

  // 2. stand ups
  var standUpsWithNotes: (StandUp & {
    notes: StandUpNote[];
  })[] = [];
  if (sprint.start_date && sprint.end_date) {
    standUpsWithNotes = await prisma.standUp.findMany({
      where: {
        project_id: projectId,
        date: {
          gte: sprint.start_date,
          lte: sprint.end_date,
        },
      },
      include: {
        notes: true,
      }
    });
  }

  // 3. retrospectives
  const last3SprintIds: number[] = await prisma.sprint.findMany({
    where: {
      project_id: projectId,
    },
    orderBy: {
      start_date: 'desc',
    },
    take: 3,
  }).then(sprints => sprints.map(sprint => sprint.id));
  const retrospectives: Retrospective[] = await prisma.retrospective.findMany({
    where: {
      sprint_id: {
        in: last3SprintIds,
      },
    },
    orderBy: {
      sprint_id: 'desc',
    },
  });
  
  const devPrompt = `
  `;
  
  const userPrompt = ``;

  // const res = await openAiClient.chat.completions.create({
  //   messages: [
  //     {
  //       "role": "developer",
  //       "content": [
  //         {
  //           "type": "text",
  //           "text": devPrompt
  //         }
  //       ]
  //     },
  //     {
  //       "role": "user",
  //       "content": [
  //         {
  //           "type": "text",
  //           "text": userPrompt
  //         }
  //       ]
  //     }
  //   ],
  //   model: "gpt-4o-mini",
  //   user: user
  // });
  // console.log( res.choices[0].message.content)
  // return res.choices[0].message.content ?? "No response from AI model"; 
  return "";
}

export {
  generateScrumCeremoniesInsights,
}

generateScrumCeremoniesInsights({
  id: 1,
  project_id: 1,
  name: "Sprint 1",
  start_date: new Date(),
  end_date: new Date(),
  status: "completed",
  duration: 2,
  goals: "Complete all tasks",
  notes: "Notes",
  collab_notes: null
}, "testuser");