import { message } from 'antd';
import { Dayjs } from 'dayjs';
import { useCallback, useMemo } from 'react';
import { confirmDeleteAnnouncement } from '../components/modals/confirm';
import { getErrorMessage } from '../helpers/error';
import {
  useGetAllCoursesQuery,
  useAddCourseUserMutation,
  useRemoveCourseUserMutation,
  useDeleteMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from './course';
import { isCurrent, isFuture, isPast } from './currentTime';
import {
  useAddProjectUserMutation,
  useGetAllProjectsQuery,
  useGetProjectQuery,
  useRemoveProjectUserMutation,
} from './project';
import { Project, Course } from './types';
import { useGetSettingsQuery } from './settings';

// Filter projects by current and past
export const useCurrentAndPastProjects = () => {
  const projectsData = useGetAllProjectsQuery();
  const { data: getSettings } = useGetSettingsQuery();

  const CURRENT_YEAR = getSettings?.current_year ?? 2022;
  const CURRENT_SEM = getSettings?.current_sem ?? 1;

  const filteredProjects = useMemo(() => {
    if (projectsData.isError || projectsData.isLoading) {
      return undefined;
    }
    return {
      pastProjects: (projectsData.data as Project[]).filter((p) =>
        isPast(p.course?.startYear, p.course?.startSem, p.course?.endYear, p.course?.endSem, CURRENT_YEAR, CURRENT_SEM),
      ),
      currentProjects: (projectsData.data as Project[]).filter((p) =>
        isCurrent(
          p.course?.startYear,
          p.course?.startSem,
          p.course?.endYear,
          p.course?.endSem,
          CURRENT_YEAR,
          CURRENT_SEM,
        ),
      ),
      futureProjects: (projectsData.data as Project[]).filter((p) =>
        isFuture(
          p.course?.startYear,
          p.course?.startSem,
          p.course?.endYear,
          p.course?.endSem,
          CURRENT_YEAR,
          CURRENT_SEM,
        ),
      ),
    };
  }, [projectsData]);

  return { ...projectsData, ...filteredProjects };
};

// Filter courses by current and past
export const useCurrentAndPastCourses = () => {
  const coursesData = useGetAllCoursesQuery();
  const { data: getSettings } = useGetSettingsQuery();

  const CURRENT_YEAR = getSettings?.current_year ?? 2022;
  const CURRENT_SEM = getSettings?.current_sem ?? 1;

  const filteredCourses = useMemo(() => {
    if (coursesData.isError || coursesData.isLoading) {
      return undefined;
    }
    return {
      pastCourses: (coursesData.data as Course[]).filter((c) =>
        isPast(c.startYear, c.startSem, c.endYear, c.endSem, CURRENT_YEAR, CURRENT_SEM),
      ),
      currentCourses: (coursesData.data as Course[]).filter((c) =>
        isCurrent(c.startYear, c.startSem, c.endYear, c.endSem, CURRENT_YEAR, CURRENT_SEM),
      ),
      futureCourses: (coursesData.data as Course[]).filter((c) =>
        isFuture(c.startYear, c.startSem, c.endYear, c.endSem, CURRENT_YEAR, CURRENT_SEM),
      ),
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
export const useCourse = (courseId?: string) => {
  const courseIdNumber = courseId ? Number(courseId) : undefined;
  const { data: courses, isLoading: isCoursesLoading } = useGetAllCoursesQuery();
  const { data: projects } = useGetAllProjectsQuery();

  const [removeUser] = useRemoveCourseUserMutation();
  const [addUser] = useAddCourseUserMutation();
  const [deleteMilestone] = useDeleteMilestoneMutation();
  const [updateMilestone] = useUpdateMilestoneMutation();

  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();

  const course = useMemo(() => {
    if (!courses || courses.length === 0 || !courseIdNumber) {
      return undefined;
    }
    const possibleCourses = courses.filter((p) => p.id === courseIdNumber);

    if (possibleCourses.length === 0) {
      return undefined;
    }
    return possibleCourses[0];
  }, [courses, courseIdNumber]);

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
          await removeUser({ id: course.id, userId }).unwrap();
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
          await addUser({ id: course?.id, userId }).unwrap();
          message.success('User added!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to add user');
      }
    },
    [addUser, course],
  );

  const handleDeleteMilestone = useCallback(
    async (milestoneId: number) => {
      try {
        if (course) {
          await deleteMilestone({ courseId: course.id.toString(), milestoneId }).unwrap();
          message.success('Milestone deleted!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to delete milestone');
      }
    },
    [deleteMilestone, course],
  );

  const handleUpdateMilestone = useCallback(
    async (
      milestoneId: number,
      payload: {
        milestoneName?: string;
        milestoneStartDate?: Dayjs;
        milestoneDeadline?: Dayjs;
      },
    ) => {
      const { milestoneDeadline, milestoneName, milestoneStartDate } = payload;
      try {
        if (course) {
          await updateMilestone({
            courseId: course.id.toString(),
            milestoneId,
            payload: {
              milestoneName,
              milestoneDeadline: milestoneDeadline?.toDate(),
              milestoneStartDate: milestoneStartDate?.toDate(),
            },
          }).unwrap();
          message.success('Milestone updated!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to update milestone');
      }
    },
    [updateMilestone, course],
  );

  const handleDeleteAnnouncement = useCallback(
    async (announcementId: number) => {
      try {
        if (course) {
          await confirmDeleteAnnouncement(async () => {
            await deleteAnnouncement({ courseId: course.id.toString(), announcementId }).unwrap();
            message.success('Announcement deleted!');
          });
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to delete announcement');
      }
    },
    [deleteAnnouncement, course],
  );

  const handleUpdateAnnouncement = useCallback(
    async (
      announcementId: number,
      payload: {
        announcementTitle?: string;
        announcementContent?: string;
      },
    ) => {
      try {
        if (course) {
          await updateAnnouncement({
            courseId: course.id.toString(),
            announcementId,
            payload,
          }).unwrap();
          message.success('Announcement updated!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to update announcement');
      }
    },
    [updateAnnouncement, course],
  );

  return {
    course,
    filteredProjects,
    handleAddUser,
    handleRemoveUser,
    handleDeleteMilestone,
    handleUpdateMilestone,
    handleDeleteAnnouncement,
    handleUpdateAnnouncement,
    isLoading: isCoursesLoading,
  };
};
