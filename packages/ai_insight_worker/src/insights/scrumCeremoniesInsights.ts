
import { BacklogHistory, Retrospective, Sprint, StandUp, StandUpNote } from "@prisma/client";
import prisma from "../models/prismaClient";
import openAiClient from "../models/openAiClient";

const mapStandUpColIdToColName = (id: number): string => {
  switch (id) {
    case 0:
      return "What's done";
    case 1:
      return "What's next";
    case 2:
      return "blockers";
    default:
      return "";
  }
}

async function generateScrumCeremoniesInsights(sprint: Sprint, user: string): Promise<string> {
  const projectId = sprint.project_id;
  const sprintId = sprint.id;

  // Analyze sprint planning, stand ups and past retrospective (no sprint review feature in trofos so can't analyze)

  // 1. sprint planning - get the backlog histories of all backlogs in this sprint, for the point they first appeared
  // in this sprint -> see if most backlogs added at the start of sprint or throughout sprint
  const historyWhenFirstAppearInSprint: {
    summary: string;
    date: Date;
  }[] = await prisma.$queryRaw`
    SELECT b.summary, bh.date
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
    INNER JOIN "Backlog" b
    ON b.backlog_id = bh.backlog_id
    AND b.project_id = bh.project_id
    WHERE bh.sprint_id = ${sprintId} AND bh.project_id = ${projectId};
  `;
  var historyString = "Backlog Summary | Date first added to sprint\n";
  historyWhenFirstAppearInSprint.forEach(history => {
    historyString += `${history.summary} | ${history.date}\n`;
  });


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
  var standUpString = "Stand Up Date | Stand Up Notes [{category, content}]\n";
  standUpsWithNotes.forEach(standUp => {
    standUpString += `${standUp.date} | `;
    var standUpNotesStringArr: string[] = [];
    standUp.notes.forEach(note => {
      standUpNotesStringArr.push(`{${mapStandUpColIdToColName(note.column_id)}, ${note.content}}`);
    });
    standUpString +=  "[" + standUpNotesStringArr.join(", ") + "]\n"; 
  });

  // 3. retrospectives. This gets prev retrospective (since this shouldn't be populated yet, since
  // sprint was just completed). last2SprintIds includes cur sprint id
  const last2SprintIds: number[] = await prisma.sprint.findMany({
    where: {
      project_id: projectId,
    },
    orderBy: {
      start_date: 'desc',
    },
    take: 2,
  }).then(sprints => sprints.map(sprint => sprint.id));
  const retrospectives: Retrospective[] = await prisma.retrospective.findMany({
    where: {
      sprint_id: {
        in: last2SprintIds,
      },
    },
    orderBy: {
      sprint_id: 'desc',
    },
  });
  var retrospectiveString = "Retrospective Type | Retrospective Content\n";
  retrospectives.forEach(retrospective => {
    retrospectiveString += `${retrospective.type} | ${retrospective.content}\n`;
  });

  const devPrompt = `You are a helpful assistant providing insights on a sprint of an Agile project, who are using our agile project managment app.
  Your goal is to analyze and generate insights on the how well the sprint planning, stand ups and previous sprint retrospective was done.

  Provided data will include:
  - Sprint start and end date
  - When backlogs were first added to the sprint
  - Stand up notes and dates
  - Previous sprint retrospective content

  Generate insights by:
  - Analyzing the sprint planning data to see if most backlogs were added at the start of the sprint or throughout the sprint and analyse if this aligns with agile best practices
  - Analyzing the stand up notes to see if the team is effectively communicating their progress, blockers and what they plan to do next
  - Analyzing the retrospective content to see if the team is effectively reflecting on their sprint and identifying areas for improvement

  Response requirements:
  - Use headings, bullet points, and short paragraphs.
  - Speak plainly; avoid jargon.
  - Provide clear, actionable recommendations for improvement.
  `;
  
  const userPrompt = `Here is the various agile ceremoies data:
Sprint Start and End Date: ${sprint.start_date} - ${sprint.end_date}

When Backlogs were first added to the sprint:
${historyString}

Stand Up Notes and Dates:
${standUpString}

Previous Sprint Retrospective Content:
${retrospectiveString}
  `;

  const res = await openAiClient.chat.completions.create({
    messages: [
      {
        "role": "developer",
        "content": [
          {
            "type": "text",
            "text": devPrompt
          }
        ]
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": userPrompt
          }
        ]
      }
    ],
    model: "gpt-4o-mini",
    user: user
  });
  console.log( res.choices[0].message.content)
  return res.choices[0].message.content ?? "No response from AI model"; 
}

export {
  generateScrumCeremoniesInsights,
}
