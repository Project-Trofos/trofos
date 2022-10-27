import { message } from 'antd';
import { useCallback, useMemo } from 'react';
import { getErrorMessage } from '../helpers/error';
import { useGetAllCoursesQuery, useAddCourseUserMutation, useRemoveCourseUserMutation } from './course';
import { isCurrent } from './currentTime';
import {
  useAddProjectUserMutation,
  useGetAllProjectsQuery,
  useGetProjectQuery,
  useRemoveProjectUserMutation,
} from './project';
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
export const useProject = (projectId: number) => {
  const { data: project, isLoading: isProjectsLoading } = useGetProjectQuery({ id: projectId });

  const [addUser] = useAddProjectUserMutation();
  const [removeUser] = useRemoveProjectUserMutation();

  const handleRemoveUser = useCallback(
    async (userId: number) => {
      try {
        if (project) {
          if (!project.users.some((u) => u.user.user_id === userId)) {
            message.error('No such user to remove!');
            return;
          }
          await removeUser({ id: project.id, userId }).unwrap();
          message.success('User removed!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to remove user');
      }
    },
    [removeUser, project],
  );

  const handleAddUser = useCallback(
    async (userId: number) => {
      try {
        if (project) {
          if (project.users.some((u) => u.user.user_id === userId)) {
            message.error('User already in this course!');
            return;
          }
          await addUser({ id: project.id, userId }).unwrap();
          message.success('User added!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to add user');
      }
    },
    [addUser, project],
  );

  return { project, course: project?.course, handleAddUser, handleRemoveUser, isLoading: isProjectsLoading };
};

// Get course information by id
export const useCourse = (courseId?: string, year?: number, sem?: number) => {
  const { data: courses, isLoading: isCoursesLoading } = useGetAllCoursesQuery();
  const { data: projects } = useGetAllProjectsQuery();

  const [removeUser] = useRemoveCourseUserMutation();
  const [addUser] = useAddCourseUserMutation();

  const course = useMemo(() => {
    if (!courses || courses.length === 0 || !courseId || !year || !sem) {
      return undefined;
    }
    const possibleCourses = courses.filter((p) => p.id === courseId && p.year === year && p.sem === sem);
    if (possibleCourses.length === 0) {
      return undefined;
    }
    return possibleCourses[0];
  }, [courses, courseId, year, sem]);

  const filteredProjects = useMemo(() => {
    if (!course || !projects) {
      return [];
    }
    return projects.filter((p) => p.course_id === course.id);
  }, [course, projects]);

  const handleRemoveUser = useCallback(
    async (userId: number) => {
      try {
        if (course) {
          if (!course.users.some((u) => u.user.user_id === userId)) {
            message.error('No such user to remove!');
            return;
          }
          await removeUser({ id: course.id, sem: course.sem, year: course.year, userId }).unwrap();
          message.success('User removed!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to remove user');
      }
    },
    [removeUser, course],
  );

  const handleAddUser = useCallback(
    async (userId: number) => {
      try {
        if (course) {
          if (course.users.some((u) => u.user.user_id === userId)) {
            message.error('User already in this course!');
            return;
          }
          await addUser({ id: course?.id, sem: course?.sem, year: course?.year, userId }).unwrap();
          message.success('User added!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to add user');
      }
    },
    [addUser, course],
  );

  return { course, filteredProjects, handleAddUser, handleRemoveUser, isLoading: isCoursesLoading };
};
