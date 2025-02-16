import { Backlog, User, UsersOnProjects } from '@prisma/client';
import prisma from '../models/prismaClient';
import openAi from '../models/openAiClient';

type BacklogWithAssignee = (Backlog & {
  assignee: (UsersOnProjects & {
    user: {
      user_display_name: string;
      user_email: string;
    };
  }) | null;
});

async function generateContributionInsights(projectId: number, sprintId: number, user: string): Promise<string> {
  const backlogsThisSprint: BacklogWithAssignee[] = await prisma.backlog.findMany({
    where: {
      sprint_id: sprintId,
      project_id: projectId,
    },
    include: {
      assignee: {
        include: {
          user: {
            select: {
              user_display_name: true,
              user_email: true,
            }
          }
        }
      }
    }
  });

  const userStoryPointContributions = new Map<string, number>();
  const usersInProject: User[] = await prisma.usersOnProjects.findMany({
    where: {
      project_id: projectId,
    },
    include: {
      user: true,
    }
  }).then(usersOnProjects => usersOnProjects.map(usersOnProject => {
    userStoryPointContributions.set(usersOnProject.user.user_email, 0);
    return usersOnProject.user
  }));

  // populate userStoryPointContributions, completedBacklogsStr, incompleteBacklogsStr
  var incompleteBacklogsStr = "Backlog summary | Assignee | Type | Priority | Status | Story Points\n";
  var completedBacklogsStr = "Backlog summary | Assignee | Type | Priority | Story Points\n";
  backlogsThisSprint.forEach(backlog => {
    if (backlog.status === "Done") {
      completedBacklogsStr += `${backlog.summary} | ${backlog.assignee?.user.user_display_name} | ${backlog.type} | ${backlog.priority} | ${backlog.points}\n`;
      if (backlog.assignee) {
        userStoryPointContributions.set(backlog.assignee.user.user_email, (userStoryPointContributions.get(backlog.assignee.user.user_email) ?? 0) + (backlog.points === null ? 0 : backlog.points));
      }
    } else {
      incompleteBacklogsStr += `${backlog.summary} | ${backlog.assignee?.user.user_display_name} | ${backlog.type} | ${backlog.priority} | ${backlog.status} | ${backlog.points}\n`;
    }
  });

  var userStoryPointContributionsStr = "User | Story Points\n";
  userStoryPointContributions.forEach((storyPoints, userEmail) => {
    userStoryPointContributionsStr += `${userEmail} | ${storyPoints}\n`;
  });

  const devPrompt = `You are a helpful assistant providing insights on a sprint of an Agile project. Generate insights regarding the contributions of each team member in the sprint.
You have data on:
  • Completed backlog items (including summary, assignee, type, priority, story points).
  • Incomplete backlog items (same fields plus status).
  • Each user’s total story points.

Generate contribution insights by:
  • Highlighting which users completed the most story points.
  • Noting any large differences in assigned tasks versus completed tasks.
  • Identifying potential improvement areas for specific users or tasks.
  • Suggesting ways the team can optimize collaboration in the next sprint.

Format your response with headings and short paragraphs. Speak plainly and give concise, actionable recommendations.`;

  const prompt = `Completed backlogs:\n${completedBacklogsStr}
Incomplete backlogs:\n${incompleteBacklogsStr}
User story point contributions:\n${userStoryPointContributionsStr}
`;

  console.log(`Contributions Prompt: ${prompt}`)

  const res = await openAi.chat.completions.create({
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
            "text": prompt
          }
        ]
      }
    ],
    model: "gpt-4o-mini",
    user: user
  });

  return res.choices[0].message.content ?? "No response from AI model";
}

export {
  generateContributionInsights,
}
