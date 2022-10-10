import { useMemo } from 'react';
import { useGetAllCoursesQuery } from './course';
import { isCurrent } from './currentTime';
import { useGetAllProjectsQuery } from './project';
import { Project, Course } from './types';

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

  const project = useMemo(() => {
    if (!projects || projects.length === 0 || !projectId) {
      return undefined;
    }
    return projects.filter((p) => p.id.toString() === projectId)[0];
  }, [projects, projectId]);

  return { project, course: project?.course, isLoading: isProjectsLoading };
};

// Get course information by id
export const useCourse = (courseId?: string) => {
  const { data: courses, isLoading: isCoursesLoading } = useGetAllCoursesQuery();
  const { data: projects } = useGetAllProjectsQuery();

  const course = useMemo(() => {
    if (!courses || courses.length === 0 || !courseId) {
      return undefined;
    }
    return courses.filter((p) => p.id.toString() === courseId)[0];
  }, [courses, courseId]);

  const filteredProjects = useMemo(() => {
    if (!course || !projects) {
      return [];
    }
    return projects.filter((p) => p.course_id === course.id);
  }, [course, projects]);

  return { course, filteredProjects, isLoading: isCoursesLoading };
};
