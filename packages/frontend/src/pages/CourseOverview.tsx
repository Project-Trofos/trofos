import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../api/auth';
import { useCourse } from '../api/hooks';
import AnnouncementCard from '../components/cards/AnnouncementCard';
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
      <MilestoneCard course={course} showEdit={showEdit} />
      <ProjectTable
        projects={filteredProjects}
        isLoading={isLoading}
        control={<BulkProjectCreationModal course={course} projects={filteredProjects} currentUserInfo={userInfo} />}
      />
    </Container>
  );
}
