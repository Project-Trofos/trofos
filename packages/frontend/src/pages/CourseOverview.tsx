import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../api/hooks';
import Container from '../components/layouts/Container';
import ProjectTable from '../components/tables/ProjectTable';

export default function CourseOverview(): JSX.Element {
  const params = useParams();
  const { filteredProjects, isLoading } = useCourse(
    params.courseId,
    Number(params.courseYear),
    Number(params.courseSem),
  );

  return (
    <Container>
      <ProjectTable projects={filteredProjects} isLoading={isLoading} />
    </Container>
  );
}
