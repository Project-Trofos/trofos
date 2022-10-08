import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../api/hooks';
import ProjectTable from '../components/tables/ProjectTable';

export default function CourseOverview(): JSX.Element {
  const params = useParams();
  const { filteredProjects, isLoading } = useCourse(params.courseId);

  return (
    <section className="course-content-container">
      <ProjectTable projects={filteredProjects} isLoading={isLoading} />
    </section>
  );
}
