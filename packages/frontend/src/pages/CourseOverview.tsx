import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../api/hooks';
import ProjectTable from '../components/tables/ProjectTable';

export default function CourseSettings(): JSX.Element {
  const params = useParams();
  const { filteredProjects, isLoading } = useCourse(params.courseId);

  return (
    <div style={{ padding: '2rem' }}>
      <ProjectTable projects={filteredProjects} isLoading={isLoading} />
    </div>
  );
}
