import { useMemo } from 'react';
import { useGetAllCoursesQuery, Course } from './course';
import { isCurrent } from './currentTime';
import { useGetAllProjectsQuery, Project } from './project';

// Filter projects by current and past
export const useCurrentAndPastProjects = () => {
  const projectsData = useGetAllProjectsQuery();

  const filteredProjects = useMemo(() => {
    if (projectsData.isError || projectsData.isLoading) {
      return undefined;
    }
    return {
      pastProjects: (projectsData.data as Project[]).filter((p) => !isCurrent(p.course_year, p.course_sem)),
      currentProjects: (projectsData.data as Project[]).filter((p) => isCurrent(p.course_year, p.course_sem)),
    };
  }, [projectsData]);

  return { ...projectsData, ...filteredProjects };
};

// Filter courses by current and past
export const useCurrentAndPastCourses = () => {
  const coursesData = useGetAllCoursesQuery();

  const filteredCourses = useMemo(() => {
    if (coursesData.isError || coursesData.isLoading) {
      return undefined;
    }
    return {
      pastCourses: (coursesData.data as Course[]).filter((c) => !isCurrent(c.year, c.sem)),
      currentCourses: (coursesData.data as Course[]).filter((c) => isCurrent(c.year, c.sem)),
    };
  }, [coursesData]);

  return { ...coursesData, ...filteredCourses };
};

// Get project information by id
export const useProject = (projectId?: string) => {
  const { data: projects, isLoading: isProjectsLoading } = useGetAllProjectsQuery();
  const { data: courses } = useGetAllCoursesQuery();

  const project = useMemo(() => {
    if (!projects || projects.length === 0 || !projectId) {
      return undefined;
    }
    return projects.filter((p) => p.id.toString() === projectId)[0];
  }, [projects, projectId]);

  const course = useMemo(() => {
    if (!project || !project.course_id || !courses) {
      return undefined;
    }
    return courses.filter((c) => c.id === project.course_id)[0];
  }, [project, courses]);

  return { project, course, isLoading: isProjectsLoading };
};
