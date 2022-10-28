import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../api/auth';
import { useCourse } from '../api/hooks';
import Container from '../components/layouts/Container';
import BulkProjectCreationModal from '../components/modals/BulkProjectCreationModal';
import ProjectTable from '../components/tables/ProjectTable';

export default function CourseOverview(): JSX.Element {
  const params = useParams();
  const { data: userInfo } = useGetUserInfoQuery();
  const { course, filteredProjects, isLoading } = useCourse(
    params.courseId,
    Number(params.courseYear),
    Number(params.courseSem),
  );

  return (
    <Container>
      <ProjectTable
        projects={filteredProjects}
        isLoading={isLoading}
        control={<BulkProjectCreationModal course={course} projects={filteredProjects} currentUserInfo={userInfo} />}
      />
    </Container>
  );
}
