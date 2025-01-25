---
layout: page
title: Project Management
permalink: /guide/project-management
---

* TOC
{:toc}

## How to view my Projects

Click the 'Projects' tab in the side bar to view your projects. Only projects where you have viewing permissions will be displayed. In the 'Projects' page, projects are further divided into past, future and present projects, determined by the start and end year and semester of the courses associated with it. If you can't find your project, try checking it 'Past projects' tab!

## What is a Project

A **Project** organizes work and collaboration in the application. It involves users, sprints, backlogs, and epics, and can be associated with a course or independent.

## Creating a project 

You can create a new project in the ‘Projects’ page by clicking on the ‘Create project’ button.  Enter your project name and key, which will be used to prefix you backlogs (ie P1-1 for your first backlog of prefix P1). You can then choose to attach this project to a course,
or leave it as an independent project. Only faculty members of a course can attach projects to a course. Similarly, only faculty memebrs can detach a project from a course after the project has been created, by clicking the 'More' icon (3 dots), in a specific project in its header displaying the project name at the top of the page..

## Viewing a project

To find your project, go to the ‘Projects’ page. You will see all the projects you have permission to. If your project is under a course, look at the corresponding ‘past’, ‘future’ or ‘present’ tabs. You can use strict project name search, or sort by course name or year. You can also use the search bar at the top to quickly navigate to a project by searching for its name.

## Deleting a project

A project can be deleted by clicking on the 'More' icon (3 dots), in a specific project in its header displaying the project name at the top of the page.

## Project Overview Dashboard and burndown chart

In the 'Overview' tab of a project, you can see a dashboard of the active sprint and a burndown chart. The dashboard shows a breakdown of what has been done so far for the active sprint, such as the number of story points completed each day and the breakdown of the statuses of backlogs. The burndown chart shows how much work is left to do in the project or sprint compared to the time remaining. It's a tool that helps teams visualize their progress and determine if they're on track to meet their goals. You can view the burndown chart of a specific sprint or the whole project with the dropdown at the top right of the chart. You can hover over points in the charts to see the details of the change in story points.

A "good" burndown chart displays a line that generally slopes downwards in a relatively straight path, closely following the "ideal" line, indicating a steady and consistent rate of work completion throughout the sprint, with the line ideally reaching zero at the end of the sprint, signifying all work is finished; essentially, it shows a consistent decrease in remaining work over time, with minimal fluctuations and a clear trend towards completion. 

## Project User Management

As a student, you can invite users by email. They will receive an email invite to join your project. Faculty members and admins can directly add users into projects and have permissions to remove users as well. You can track email invites sent in the project users page as well.

## Project sprints

You can view and manage your sprints in a project's 'Sprint' tab. A sprint is a short, focused period of work. In TROFOS, sprints have 3 states- upcoming, active and completed. An active sprint's details will be displayed in the project 'Board' tab in a scrum board, and completed sprints will have details of past backlogs, sprint boards and sprint retrospectives. In TROFOS, sprints are made up of backlogs. Some other additional features of sprints in TROFOS include sprint goals, sprint notes, scrum boards and sprint retrospectives. Avoid using the 'Sprint notes' in the sprint page as it is not synchronized with your groupmates and will be removed in the future. Instead, use the sprint notes in the 'Board' tab. It is comparable to Google Docs and changes made are reflected in real time.

## Creating a sprint

In the 'Sprint' tab of a project, click the 'New sprint' button to create sprints. Fill up the name, duration, start date and sprint goal if necessary. For less common sprint durations, select 'custom' in the sprint duration dropdown, and you can specify an end date for the sprint.

## Editing a sprint

To edit a sprint, click on the gear icon on a sprint in the 'Sprint' tab in a project. Details like the name, duration, start date and sprint goal can be edited.

## Completing a sprint

To complete a sprint, click on the 'Complete sprint' button button on an active sprint in the 'Sprint' tab in a project. You should end sprints on its end date- if there are incomplete backlogs, move them over to the next sprint. Avoid dragging out a sprint for incomplete backlog items. Upon completing a sprint, it opens up the sprint retrospective for that sprint.

## Sprint retrospective

Upon the completion of a sprint, you can access the retrospective page for that sprint in the 'Sprint' tab of a project, click on the 'Retrospective' button of a sprint. The Sprint Retrospective is an important part of Agile project management. Reflect on your sprint with these sections:

* **What Went Well**: Note successes (e.g., "Completed all sprint goals on time", "Daily stand-ups improved communication").

* **What Could Be Done Better**: Identify issues constructively (e.g., "Underestimated task complexity", "Testing environment caused delays").

* **Actions for Next Sprint**: Plan specific, actionable steps (e.g., "Refine task breakdowns for better estimates", "Document testing process").

Tips:

- Be honest and constructive.
- Focus on process, not blame.
- Collaborate for team alignment.

## Reopening a sprint

The most recently closed sprint can be re-opened if you have yet to start (make active) another sprint. Under the completed sprints section in the 'Sprint' tab of a project, click on the 'Reopen sprint' button.

## Backlogs

A **backlog** represents a single task, issue, or piece of work that needs to be completed. It contains all the details about the work, such as who is responsible, its priority, and its progress. Think of it as a structured way to track and manage individual tasks within your project. A backlog consists of the following fields:

- **Status**: Tracks progress (e.g., To Do, In Progress, Done). You can add custom statuses in Project Settings.

- **Assignee**: The team member responsible for the ticket.

- **Type**: Classifies the ticket as:

  - Story: A feature or user requirement.
  - Bug: An issue to fix.
  - Task: A general work item.

- **Priority**: Indicates urgency, from Very Low to Very High.

- **Sprint**: Links the ticket to a sprint.

- **Epic**: Connects the ticket to a larger goal or feature.

- **Story Points**: Estimates the effort required. For example, you can define 1 story point to be 4 hours of effort.

- **Reporter**: The person who created the ticket.

- **Comments**: A space for updates or discussions about the ticket.

## Viewing and editing a backlog

To view the details of a backlog, click on the backlog ID in a backlog, in the 'Sprint' tab of a project. You can edit the details of a backlog in this page. Alternatively, you can edit some of the fields in the minified backlog in the project Sprints page. The scrum board also easliy allows you to change backlog statuses with a drag and drop interface.

## Epics

An epic is a large body of work that can be broken down into smaller tasks, (backlogs). It represents a major goal or feature in your project and helps you organize related work under one overarching theme.

Epics group related tickets (e.g., stories, bugs, tasks) to provide a high-level view of progress on a specific goal.
Example: An epic titled "User Authentication" might include tickets for "Design login page," "Implement password reset," and "Add multi-factor authentication."

## Scrum board

A scrum board is a visual tool used in Agile to track the progress of tasks during a sprint. It organizes backlog items into columns representing their statuses (e.g., To Do, In Progress, Done) and helps teams collaborate and stay updated on project progress. The scrum board of TROFOS will reflect the status of the current active sprint.

**Key Features**

- Drag-and-Drop: Move backlog items across statuses or assign them to team members by dragging and dropping within the table.

- Add Backlogs: Quickly create new backlog items directly on the board.

- Integrated Standup Board: Schedule a standup for today if you need to discuss progress or blockers. After scheduling, access the standup board in the Standups Tab to view the day’s discussion topics and updates.

- Live Sprint Notes: Collaborate on live, Google Docs-like rich text editor for sprint discussions or updates.

## Stand ups

Standups are short team meetings in Agile where members share three key updates: what’s done, what’s next, and any blockers. The goal is to keep everyone aligned, identify issues early, and adjust plans if needed. These are usually quick, lasting around 15 minutes, and focus on collaboration and progress.

You can manage standups easily using the 'Standup' tab in your project. Here’s how it works:

- Schedule Standups: Click the Schedule Standup button in the Standup Tab to set up a new standup for your team.

- View Standup Details: Click on any standup to see its board. The standup board organizes updates into What’s Done, What’s Next, and Blockers, making it similar to the Scrum Board but tailored for team discussions.

For convenience, if a standup is scheduled for today, you can also access it directly from the Scrum Board under the Standup Tab within the Board page.

You can add updates to the standup board in two ways:

1. Hover over Backlogs: On the Scrum Board, hover over a backlog’s gear icon to mark it as Done, Next, or Blocker for the standup.
1. Manual Input: In the standup board, type in your updates for each section directly.

## Project statistics

The Statistics Tab provides visual insights into your project’s progress, helping you understand team performance and identify trends. The charts and tools here cater to both experienced Agile teams and students new to these concepts. You can view stats for the entire project or filter them by a specific sprint.

Available Charts and Tools:

**1. Sprint Velocity**

A bar chart showing the team's performance over sprints.

- **X-Axis**: Represents sprints.
- **Y-Axis**: Represents story points.
- **Bars**:
  - **Committed**: Story points planned at the start of the sprint.
  - **Completed**: Story points actually finished by the end.

**How to Use It**:
- Sprint velocity helps you understand how much work your team can handle over time, which is useful for planning future sprints.
- Compare the committed and completed bars for each sprint to identify patterns.
- Large gaps might indicate overcommitment or unexpected blockers.

---

**2. Cumulative Flow Diagram (CFD)**

A line chart that tracks the cumulative progress of story points over time.

- **X-Axis**: Time (by date).
- **Y-Axis**: Cumulative story points.
- **Lines**: Represent backlog statuses:
  - **To Do**
  - **In Progress**
  - **Done**

**How to Use It**:
- CFDs help you monitor workflow stability, ensuring work is progressing smoothly across statuses.
- Use the date input field to focus on a specific time range.
- Look for consistent, upward trends in the **Done** line, which indicates progress.
- If the **In Progress** or **To Do** lines plateau, it might suggest bottlenecks.

---

**3. Overall Burndown**

Tracks total work remaining for the project versus time.

- **Key Insight**: A steady decline shows progress; plateaus suggest delays.

**How to Use It**:
- A burndown chart helps the team measure whether they’re on track to finish the project within the expected timeline.
- Check the slope: Steeper declines mean faster completion.
- Adjust workload or resources if the burndown doesn’t align with your project deadlines.

---

**4. Story Point Contribution Pie Chart**

A pie chart that breaks down story point contributions by user.

**How to Use It**:
- Visualize team workload distribution and identify potential imbalances.
- Ensure workload is evenly distributed.
- Use this chart to recognize high contributors and redistribute tasks if needed.

---

**5. Backlog Table**

A table listing all backlogs in the project.

- Includes details like **status**, **story points**, and **assignee**.

---

## Project report

The Project Report compiles all the key components of your project into a single, organized document. It’s designed to help you easily summarize and present your work, making it especially useful for students preparing writeups or final submissions. Use it to reflect on and present your Agile experience.

## Project settings

The **Project Settings** section allows you to customize and manage key aspects of your project.

- **Update Project Title and Description**  
  Edit the title and description to reflect your project’s purpose or current focus.

- **Add New Backlog Statuses**  
  If the default statuses (**To Do**, **In Progress**, **Done**) don’t meet your needs, you can create custom statuses to better track your workflow.  
  *Example*: Add statuses like **Under Review** or **Testing** for more detailed progress tracking.

- **GitHub Linkage and Telegram Channel Notifications**  
  - **GitHub Linkage**: Set up integration to track commits or pull requests related to your project.  
  - **Telegram Notifications**: Receive updates in your Telegram channel by:  
    - Adding **@trofos_nus_bot** to your Telegram channel.  
    - Running the `/start` command.  
    - Copying your channel’s ID into the Project Settings.  
  *Note*: These features are currently being reviewed for full functionality and will be enabled in future updates.

- **User Settings**  
  Additional options for customizing user-specific preferences are included and will be fully operational soon.

---

**Future Updates**

Our team is actively working to ensure all features, like GitHub and Telegram integrations, are fully functional and seamless to use. Stay tuned for updates!
