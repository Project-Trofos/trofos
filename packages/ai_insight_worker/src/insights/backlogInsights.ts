import { Backlog, BacklogHistory, Sprint } from "@prisma/client";
import prisma from "../models/prismaClient";
import openAiClient from "../models/openAiClient";

async function generateBacklogInsights(curSprint: Sprint, user: string): Promise<string> {
  const sprintId = curSprint.id;
  const projectId = curSprint.project_id;

  // Get summary of what was planned this sprint and what was completed
  const backlogsThisSprint: Backlog[] = await prisma.backlog.findMany({
    where: {
      sprint_id: sprintId,
      project_id: projectId,
    },
  });
  const completedBacklogs = backlogsThisSprint.filter(backlog => backlog.status === "Done");
  const incompleteBacklogs = backlogsThisSprint.filter(backlog => backlog.status !== "Done");
  const completedBacklogStr = "Backlog ID | summary | Description | Type | Priority | Story Points\n"
    + completedBacklogs.map(backlog => `${backlog.backlog_id} | ${backlog.summary} | ${backlog.description} | ${backlog.type} | ${backlog.priority} | ${backlog.points}`).join("\n") + "\n";
  const incompleteBacklogStr = "Backlog ID | summary | Description | Type | Priority | Status | Story Points\n"
    + incompleteBacklogs.map(backlog => `${backlog.backlog_id} | ${backlog.summary} | ${backlog.description} | ${backlog.type} | ${backlog.priority} | ${backlog.status} | ${backlog.points}`).join("\n") + "\n";

  const curSprintDurationStr = `Sprint started on ${curSprint.start_date} and ends on ${curSprint.end_date}`;

  // Get backlog history for this sprint
  const backlogHistory: BacklogHistory[] = await prisma.backlogHistory.findMany({
    where: {
      sprint_id: sprintId,
      project_id: projectId,
    },
    orderBy: {
      date: 'asc',
    }
  });
  const curSprintBacklogChangesStr = `Backlog ID | Date | Type | History Type | Status | Priority | Story Points\n`
   + backlogHistory.map(history => `${history.backlog_id} | ${history.date} | ${history.type} | ${history.history_type} | ${history.status} | ${history.priority} | ${history.points}`).join("\n") + "\n";

  const prevSprint = await prisma.sprint.findFirst({
    where: {
      project_id: projectId,
      start_date: {
        lt: curSprint.start_date as Date,
      },
    },
    orderBy: {
      start_date: 'desc',
    },
    take: 1,
  });

  // Search for rolled over task and previously uncompleted tasks
  var incompleteBacklogsFromPrevSprintStr = "";
  var rolledOverBacklogsStr = "";
  if (prevSprint !== null) {
    const incompleteBacklogsFromPrevSprint = await prisma.backlog.findMany({
      where: {
        sprint_id: prevSprint.id,
        project_id: projectId,
        status: {
          not: "Done",
        },
      },
    });
    incompleteBacklogsFromPrevSprintStr = "Backlog ID | summary | Description | Type | Priority | Status | Story Points\n"
     + incompleteBacklogsFromPrevSprint.map(backlog => `${backlog.backlog_id} | ${backlog.summary} | ${backlog.description} | ${backlog.type} | ${backlog.priority} | ${backlog.status} | ${backlog.points}`).join("\n") + "\n";
    // Get rolled over tasks
    // backloghistory with no create this sprint (from last sprint)
    const rolledOverBacklogIds = await prisma.backlogHistory.findMany({
      where: {
        sprint_id: sprintId,
        project_id: projectId,
        backlog_id: {
          notIn: (
            await prisma.backlogHistory.findMany({
              where: {
                sprint_id: sprintId,
                history_type: "create",
              },
              select: {backlog_id: true}
            })
          ).map(history => history.backlog_id),
        }
      },
      select: {
        backlog_id: true,
      },
      distinct: ['backlog_id'],
    });
    const rolledOverBacklogs = await prisma.backlog.findMany({
      where: {
        backlog_id: {
          in: rolledOverBacklogIds.map(history => history.backlog_id),
        },
        project_id: projectId,
      },
    });
    rolledOverBacklogsStr = "Backlog ID | summary | Description | Type | Priority | Status | Story Points\n"
      + rolledOverBacklogs.map(backlog => `${backlog.backlog_id} | ${backlog.summary} | ${backlog.description} | ${backlog.type} | ${backlog.priority} | ${backlog.status} | ${backlog.points}`).join("\n") + "\n";
  }

  const devPrompt = `You are a helpful assistant providing insights on a sprint of an Agile project, who are using our agile project managment app.
  Your goal is to analyze and generate insights on the sprint's backlog activity and team contributions based on task completion and backlog movement.
  
  Provided data will include:
  - Completed backlog items (summary, assignee, type, priority).
  - Incomplete backlog items (same fields plus status).
  - Backlog history (task status changes over time).
  - Previous sprint's incomplete tasks and rolled-over tasks.

  Summarise what was planned and what was done in the sprint.
  
  Generate insights by:
  - Checking backlogs were not rushed or left incomplete according to completed dates.
  - Highlighting which tasks were completed and which remained unfinished.
  - Only if there are rolled over items, identify any patterns in task rollovers from the previous sprint.
  - Noting any abnormalities in backlog updates in the backlog changes.
  - Suggesting how the team can better plan and collaborate in the next sprint.
  
  Response requirements:
  - Use headings, bullet points, and short paragraphs.
  - Speak plainly; avoid jargon.
  - Provide clear, actionable recommendations for improvement.
  `;
  const userPrompt = `Here is the sprint data:
Sprint Info:
${curSprintDurationStr}

Completed Backlogs:
${completedBacklogStr}

Incomplete Backlogs:
${incompleteBacklogStr}

Backlog Changes:
${curSprintBacklogChangesStr}

Previous Sprint Incomplete:
${incompleteBacklogsFromPrevSprintStr}

Rolled Over Items:
${rolledOverBacklogsStr}

Please analyze this sprint and provide insights on what went well, what could be improved, and how the team can collaborate better in the next sprint.
`;
  console.log(userPrompt);

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
  generateBacklogInsights,
}
