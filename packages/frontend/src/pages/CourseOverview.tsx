import { Card } from 'antd';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../api/auth';
import { useGetBacklogHistoryQuery, useGetBacklogsQuery } from '../api/backlog';
import { useCourse } from '../api/hooks';
import { useGetSprintsQuery } from '../api/sprint';
import AnnouncementCard from '../components/cards/AnnouncementCard';
import CourseOverviewCard from '../components/cards/CourseOverviewCard';
import MilestoneCard from '../components/cards/MilestoneCard';
import Container from '../components/layouts/Container';
import BulkProjectCreationModal from '../components/modals/BulkProjectCreationModal';
import ProjectTable from '../components/tables/ProjectTable';
import { canDisplay } from '../helpers/conditionalRender';
import { UserPermissionActions } from '../helpers/constants';

export default function CourseOverview(): JSX.Element {
  const params = useParams();
  const { data: userInfo } = useGetUserInfoQuery();
  const { course, filteredProjects, isLoading, handleDeleteAnnouncement, handleUpdateAnnouncement } = useCourse(
    params.courseId,
  );

  const { data: backlogs } = useGetBacklogsQuery();
  const { data: sprints } = useGetSprintsQuery();
  const { data: backlogHistory } = useGetBacklogHistoryQuery();

  const sprintsInCourse = useMemo(() => {
    if (!sprints) {
      return [];
    }
    const projectIds = filteredProjects.map((p) => p.id);

    return sprints.filter((s) => projectIds.includes(s.project_id));
  }, [sprints, filteredProjects]);

  const unassignedBacklogsInCourse = useMemo(() => {
    if (!backlogs) {
      return [];
    }
    const projectIds = filteredProjects.map((p) => p.id);

    return backlogs.filter((b) => projectIds.includes(b.project_id)).filter((b) => b.sprint_id === null);
  }, [backlogs, filteredProjects]);

  const backlogHistoryInCourse = useMemo(() => {
    if (!backlogHistory) {
      return [];
    }
    const sprintIds = sprintsInCourse.map((s) => s.id);
    return backlogHistory.filter((b) => b.sprint_id && sprintIds.includes(b.sprint_id));
  }, [sprintsInCourse, backlogHistory]);

  const showEdit = canDisplay(userInfo?.userRoleActions || [], [
    UserPermissionActions.ADMIN,
    UserPermissionActions.UPDATE_COURSE,
  ]);

  return (
    <Container>
      <AnnouncementCard
        course={course}
        showEdit={showEdit}
        handleDeleteAnnouncement={handleDeleteAnnouncement}
        handleUpdateAnnouncement={handleUpdateAnnouncement}
      />
      {course && <MilestoneCard course={course} showEdit={showEdit} />}
      <CourseOverviewCard
        projects={filteredProjects}
        sprints={sprintsInCourse}
        unassignedBacklogs={unassignedBacklogsInCourse}
        backlogHistory={backlogHistoryInCourse}
      />
      <Card>
        <ProjectTable
          projects={filteredProjects}
          isLoading={isLoading}
          control={<BulkProjectCreationModal course={course} projects={filteredProjects} currentUserInfo={userInfo} />}
        />
      </Card>
    </Container>
  );
}
