/* eslint-disable object-shorthand */
import { message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useMemo } from 'react';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { confirmDeleteAnnouncement } from '../components/modals/confirm';
import { sortOptions as projectSortOptions } from '../pages/projectsPages/ProjectsBody';
import { sortOptions as courseSortOptions } from '../pages/coursesPages/CoursesBody';
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
  useGetAssignedProjectsQuery,
  useGetProjectQuery,
  useRemoveProjectUserMutation,
} from './project';
import {
  useGetCourseUserRolesQuery,
  useGetProjectUserRolesQuery,
  useUpdateCourseUserRoleMutation,
  useUpdateProjectUserRoleMutation,
} from './role';
import { useParams } from 'react-router-dom';

export const useProjectIdParam = () => {
  const params = useParams();
  const projectId = Number(params.projectId);
  return projectId;
};

export const useSprintIdParam = () => {
  const params = useParams();
  const sprintId = Number(params.sprintId);
  return sprintId;
};

// Filter projects by current and past
export const useCurrentAndPastProjects = ({
  pageSize,
  pageIndex,
  searchNameParam,
  sortOption,
}: {
  pageSize?: number;
  pageIndex?: number;
  searchNameParam?: string;
  sortOption?: string;
} = {}) => {
  const projectsData = useGetAllProjectsQuery({
    pageSize,
    pageIndex,
    keyword: searchNameParam,
    sortBy: sortOption,
  });

  const pastProjectsData = useGetAllProjectsQuery({
    pageSize,
    pageIndex,
    keyword: searchNameParam,
    sortBy: sortOption,
    option: 'past',
  });

  const currentProjectsData = useGetAllProjectsQuery({
    pageSize,
    pageIndex,
    keyword: searchNameParam,
    sortBy: sortOption,
    option: 'current',
  });

  const futureProjectsData = useGetAllProjectsQuery({
    pageSize,
    pageIndex,
    keyword: searchNameParam,
    sortBy: sortOption,
    option: 'future',
  });

  const isLoading = projectsData.isLoading || pastProjectsData.isLoading || currentProjectsData.isLoading || futureProjectsData.isLoading;

  return {
    projectsData: projectsData.data?.data,
    projectTotalCount: projectsData.data?.totalCount,
    currentProjects: currentProjectsData.data?.data,
    currentProjectTotalCount: currentProjectsData.data?.totalCount,
    pastProjects: pastProjectsData.data?.data,
    pastProjectTotalCount: pastProjectsData.data?.totalCount,
    futureProjects: futureProjectsData.data?.data,
    futureProjectTotalCount: futureProjectsData.data?.totalCount,
    isLoading,
  };
};

// Filter courses by current and past
export const useCurrentAndPastCourses = ({
  pageSize,
  pageIndex,
  searchNameParam,
  sortOption,
}: {
  pageSize?: number;
  pageIndex?: number;
  searchNameParam?: string;
  sortOption?: string;
} = {}) => {
  const allCoursesData = useGetAllCoursesQuery({
    pageSize,
    pageIndex,
    keyword: searchNameParam,
    sortBy: sortOption,
  });
  const pastCourseData = useGetAllCoursesQuery({
    pageSize,
    pageIndex,
    keyword: searchNameParam,
    sortBy: sortOption,
    option: 'past',
  });
  const currentCourseData = useGetAllCoursesQuery({
    pageSize,
    pageIndex,
    keyword: searchNameParam,
    sortBy: sortOption,
    option: 'current',
  });
  const futureCourseData = useGetAllCoursesQuery({
    pageSize,
    pageIndex,
    keyword: searchNameParam,
    sortBy: sortOption,
    option: 'future',
  });
  const isLoading = allCoursesData.isLoading || pastCourseData.isLoading || currentCourseData.isLoading || futureCourseData.isLoading;

  return {
    allCourses: allCoursesData.data?.data,
    allCourseTotalCount: allCoursesData.data?.totalCount,
    pastCourses: pastCourseData.data?.data,
    pastCourseTotalCount: pastCourseData.data?.totalCount,
    currentCourses: currentCourseData.data?.data,
    currentCourseTotalCount: currentCourseData.data?.totalCount,
    futureCourses: futureCourseData.data?.data,
    futureCourseTotalCount: futureCourseData.data?.totalCount,
    isLoading,
  };
};

// Get project information by id
export function useProject(projectId: number) {
  const { data: project, isLoading: isProjectsLoading } = useGetProjectQuery({ id: projectId });
  const { data: userRoles } = useGetProjectUserRolesQuery(projectId);
  const { data: assignedProjects } = useGetAssignedProjectsQuery({ projectId });

  const [addUser] = useAddProjectUserMutation();
  const [removeUser] = useRemoveProjectUserMutation();
  const [updateUserProjectRole] = useUpdateProjectUserRoleMutation();

  const projectCourseData = project?.course.shadow_course ? undefined : project?.course;

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
    async (userEmail: string) => {
      try {
        if (project) {
          if (project.users.some((u) => u.user.user_email === userEmail)) {
            message.error('User already in this course!');
            return;
          }
          await addUser({ id: project.id, userEmail }).unwrap();
          message.success('User added!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to add user');
      }
    },
    [addUser, project],
  );

  const handleUpdateUserRole = useCallback(
    async (roleId: number, userId: number) => {
      try {
        if (project) {
          await updateUserProjectRole({
            id: projectId,
            userRole: roleId,
            userId: userId,
          }).unwrap();
          message.success('User role changed!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to modify user role');
      }
    },
    [updateUserProjectRole, project, projectId],
  );

  const projectUserRoles = useMemo(() => {
    if (!project) {
      return undefined;
    }

    return userRoles;
  }, [project, userRoles]);

  return {
    project,
    assignedProjects,
    projectUserRoles,
    course: projectCourseData,
    handleAddUser,
    handleRemoveUser,
    handleUpdateUserRole,
    isLoading: isProjectsLoading,
  };
}

// Get course information by id
export const useCourse = (courseId?: string) => {
  const courseIdNumber = courseId ? Number(courseId) : undefined;
  const { data: courses, isLoading: isCoursesLoading } = useGetAllCoursesQuery({
    ids: courseIdNumber ? [courseIdNumber] : undefined,
  });
  const { data: filteredProjects } = useGetAllProjectsQuery({
    courseId: courseIdNumber
  });

  const [removeUser] = useRemoveCourseUserMutation();
  const [addUser] = useAddCourseUserMutation();
  const [updateUserCourseRole] = useUpdateCourseUserRoleMutation();
  const [deleteMilestone] = useDeleteMilestoneMutation();
  const [updateMilestone] = useUpdateMilestoneMutation();
  const { data: userRoles } = useGetCourseUserRolesQuery(courseIdNumber ?? skipToken);

  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();

  const course = useMemo(() => {
    if (!courses || courses.data.length === 0 || !courseIdNumber) {
      return undefined;
    }
    const possibleCourses = courses.data.filter((p) => p.id === courseIdNumber);

    if (possibleCourses.length === 0) {
      return undefined;
    }

    return possibleCourses[0];
  }, [courses, courseIdNumber]);

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
    async (userEmail: string) => {
      try {
        if (course) {
          if (course.users.some((u) => u.user.user_email === userEmail)) {
            message.error('User already in this course!');
            return;
          }
          await addUser({ id: course?.id, userEmail }).unwrap();
          message.success('User added!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to add user');
      }
    },
    [addUser, course],
  );

  const handleUpdateUserRole = useCallback(
    async (roleId: number, userId: number) => {
      try {
        if (course) {
          await updateUserCourseRole({
            id: course.id,
            userRole: roleId,
            userId: userId,
          }).unwrap();
          message.success('User role changed!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
        message.error('Failed to modify user role');
      }
    },
    [course, updateUserCourseRole],
  );

  const courseUserRoles = useMemo(() => {
    if (!courses || courses.data.length === 0 || !courseIdNumber) {
      return undefined;
    }

    return userRoles;
  }, [courses, userRoles, courseIdNumber]);

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
    courseUserRoles,
    handleAddUser,
    handleRemoveUser,
    handleDeleteMilestone,
    handleUpdateMilestone,
    handleUpdateUserRole,
    handleDeleteAnnouncement,
    handleUpdateAnnouncement,
    isLoading: isCoursesLoading,
  };
};
