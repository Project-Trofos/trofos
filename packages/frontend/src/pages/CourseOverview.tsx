import { Card } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../api/auth';
import { useCourse } from '../api/hooks';
import { useIsCourseManager } from '../api/hooks/roleHooks';
import AnnouncementCard from '../components/cards/AnnouncementCard';
import MilestoneCard from '../components/cards/MilestoneCard';
import Container from '../components/layouts/Container';
import BulkProjectCreationModal from '../components/modals/BulkProjectCreationModal';
import ProjectTable from '../components/tables/ProjectTable';

export default function CourseOverview(): JSX.Element {
  const params = useParams();
  const { data: userInfo } = useGetUserInfoQuery();
  const { course, filteredProjects, isLoading, handleDeleteAnnouncement, handleUpdateAnnouncement } = useCourse(
    params.courseId,
  );

  const { isCourseManager } = useIsCourseManager();

  return (
    <Container>
      <AnnouncementCard
        course={course}
        showEdit={isCourseManager}
        handleDeleteAnnouncement={handleDeleteAnnouncement}
        handleUpdateAnnouncement={handleUpdateAnnouncement}
      />
      {course && <MilestoneCard course={course} />}
      <Card>
        <ProjectTable
          projects={filteredProjects}
          isLoading={isLoading}
          control={
            isCourseManager &&
            course &&
            userInfo && (
              <BulkProjectCreationModal course={course} projects={filteredProjects} currentUserInfo={userInfo} />
            )
          }
          onlyShowActions={isCourseManager ? undefined : ['GOTO']}
        />
      </Card>
    </Container>
  );
}
