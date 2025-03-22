---
layout: page
title: Course Management
permalink: /guide/course-management
---

- TOC
  {:toc}

## How to View Your Courses

<!-- API: GET /api/course/ -->

To view your courses, follow these steps:

- Click the **‘Courses’** tab in the sidebar.
- Only courses where you have viewing permissions will be displayed.

On the **‘Courses’** page, courses are divided into:

- **Past Courses**: Courses that have already ended.
- **Present Courses**: Ongoing courses.
- **Future Courses**: Courses that have not started yet.

If you can’t find your course, check the **‘Past Courses’** tab to see completed or archived courses.

## What is a Course?

A course in TROFOS represents a university course, such as **Software Testing (CS4218)** at the National University of Singapore. It serves as a container for organizing and managing related projects and students within a course offering.

## Viewing a course

To find your course, go to the **‘Courses’** page. You will see all the courses you have permission to access.

If your course is categorized, check the corresponding **‘Past’**, **‘Future’**, or **‘Present’** tabs.

You can:

- Perform a strict course name search.
- Sort courses by **name** or **year**.
- Use the **search bar** at the top to quickly locate a course by typing its name.

## Course Announcements

<!-- API: GET /api/course/:courseId/announcement -->
<!-- API: POST /api/course/:courseId/announcement -->
<!-- API: PUT /api/course/:courseId/announcement/:announcementId -->
<!-- API: DELETE /api/course/:courseId/announcement/:announcementId -->

On the **Overview** page of a specific course (default display), you will find a table listing all announcements for the course.

- **For Faculty Members**:
  - Use the **‘New’** button at the top right of the table to create a new announcement.
  - Edit or delete existing announcements by clicking the relevant buttons beside each announcement in the table.

## Course Milestones

<!-- API: GET /api/course/:courseId/milestone -->
<!-- API: POST /api/course/:courseId/milestone -->
<!-- API: PUT /api/course/:courseId/milestone/:milestoneId -->
<!-- API: DELETE /api/course/:courseId/milestone/:milestoneId -->

Milestones represent significant points in a project or course timeline. In Agile, milestones often mark key deliverables or progress checks. However, in TROFOS, they are commonly set by faculty members to structure and track student projects.

- **Where to Find Milestones**:  
  Milestones are displayed on the **Overview** page of a course, below the announcements table.

---

**For Faculty Members**

- **Creating Milestones**:

  - Go to the **‘Milestone’** tab in the course to create new milestones.

- **Viewing Sprints in Milestones**:
  - In the **‘Sprints in Milestone’** table, view sprints from projects where the start date falls within the timeframe of a milestone.
  - Select a milestone to see a list of sprints for each group, along with quick links to the sprint’s Scrum Board for further details.

These tools help faculty align student project timelines with course milestones and monitor progress efficiently.

## Managing Projects in a course

<!-- API: POST /api/course/bulk -->
<!-- API: POST /api/course/project -->
<!-- API: GET /api/course/:courseId/project -->
<!-- API: POST /api/course/:courseId/project -->
<!-- API: DELETE /api/course/:courseId/project -->

Faculty members can manage projects within a course using the **Projects Table** on the **Overview** page of the course.

- **Features for Faculty**:
  - Visit individual projects.
  - Delete or detach projects from the course.

---

**Bulk Create Functionality**

Faculty can quickly assign users without a project to groups of a specified size using the **‘Bulk Create’** feature.

Steps to use **Bulk Create**:

1. Click the **‘Bulk Create’** button at the top right of the projects table.
2. Select users from the displayed list (only users without a project in this course will appear).
3. Specify the desired group size.
4. Click the **‘Generate’** button to form groups.
5. Review the generated groups, and if satisfied, click **‘OK’** to create them.

This feature streamlines group assignment, especially for large classes.

## Import Accounts for New Students

<!-- API: POST /api/course/:courseId/import/csv -->

Faculty can create accounts for new students and assign them to project groups within a course using the **‘Import CSV Data’** feature.

Steps to bulk import accounts:

1. In the course, click the **‘Import CSV Data’** button in the course header (located at the top of the page displaying the course name).
2. Download the provided CSV template.
3. Fill in the template with the required details, including project group assignments for the students.
4. Upload the completed file and click **‘Import’**.

This process will automatically create new accounts and group students into the specified project groups under the course.

# Course Statistics Dashboard

Faculty members can access the **‘Statistics’** tab within a course to view a dashboard summarizing the status of projects in the course. This provides insights into project progress and performance at a glance.

---

**Available Charts**

- **Backlog Status Breakdown (Pie Chart)**  
  Visualizes the distribution of backlogs across different statuses (e.g., To Do, In Progress, Done).

- **Daily Completed Story Points (Bar Chart)**  
  Tracks the number of story points completed each day across all projects in the course.

- **Active Sprint Story Points (Bar Chart)**  
  Displays the active sprint’s story points for each group.
  - Each group has its own chart.
  - Bars are broken down by backlog status to show progress within the sprint.

---

These charts allow faculty to monitor overall progress, identify bottlenecks, and ensure groups are on track with their projects.
