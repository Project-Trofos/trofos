/* eslint-disable object-shorthand */
import { message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useMemo } from 'react';
import { skipToken } from '@reduxjs/toolkit/dist/query';
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
import {
  useGetCourseUserRolesQuery,
  useGetProjectUserRolesQuery,
  useUpdateCourseUserRoleMutation,
  useUpdateProjectUserRoleMutation,
} from './role';
import { Project, Course } from './types';
import { useGetSettingsQuery } from './settings';
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
  searchNameParam,
}: {
  searchNameParam?: string;
} = {}) => {
  const projectsData = useGetAllProjectsQuery();
  const { data: settings } = useGetSettingsQuery();

  const filteredProjects = useMemo(() => {
    const CURRENT_YEAR = settings?.current_year ?? dayjs().year();
    const CURRENT_SEM = settings?.current_sem ?? 1;

    if (projectsData.isError || projectsData.isLoading) {
      return undefined;
    }

    const projects = (projectsData.data as Project[]).map((project) => {
      if (project.course?.shadow_course) {
        return { ...project, course: undefined, course_id: null };
      }
      return project;
    });

    const projectsFilteredByName = searchNameParam
      ? projects.filter((p) => p.pname?.toLowerCase().includes(searchNameParam.toLocaleLowerCase()))
      : projects;

    // Sort by course year and sem, then course name and project name
    const projectsSorted = projectsFilteredByName.sort((a, b) => {
      const aHasCourse = a.course != null;
      const bHasCourse = b.course != null;
      // If either project has a course, put it first
      if (aHasCourse !== bHasCourse) {
        return aHasCourse ? -1 : 1;
      }
      // If both projects have a course
      if (aHasCourse && bHasCourse) {
        if (a.course!.startYear !== b.course!.startYear) {
          return a.course!.startYear - b.course!.startYear;
        }
        if (a.course!.startSem !== b.course!.startSem) {
          return a.course!.startSem - b.course!.startSem;
        }

        // Sort by course name
        if (a.course!.cname !== b.course!.cname) {
          return a.course!.cname.localeCompare(b.course!.cname);
        }
      }
      // Sort by project name
      return a.pname.localeCompare(b.pname);
    });

    // archive false, date current or future -> move to current or future
    // archive null, date current or future -> move to current or future
    // archive true , date current or future -> move to past
    // archive false, date in the past -> move to current (because user probably unarchived this project)
    // archive null, date in the past -> move to past
    // archive true, date in the past -> move to past
    return {
      pastProjects: projectsSorted.filter(
        (p) =>
          !(p.is_archive === false) &&
          (p.is_archive ||
            isPast(
              p.course?.startYear,
              p.course?.startSem,
              p.course?.endYear,
              p.course?.endSem,
              CURRENT_YEAR,
              CURRENT_SEM,
            )),
      ),
      currentProjects: projectsSorted.filter(
        (p) =>
          !p.is_archive && // if is_archive is true, don't put it in current projects even if date is current
          ((p.is_archive === false &&
            !isFuture(
              // this isFuture() check handles edge case where user archives then unarchives a future project, it should go under future and not current projects
              p.course?.startYear,
              p.course?.startSem,
              p.course?.endYear,
              p.course?.endSem,
              CURRENT_YEAR,
              CURRENT_SEM,
            )) || // if is_archive is false and not null, put it in current projects even if the date is in the past
            isCurrent(
              p.course?.startYear,
              p.course?.startSem,
              p.course?.endYear,
              p.course?.endSem,
              CURRENT_YEAR,
              CURRENT_SEM,
            )),
      ),
      futureProjects: projectsSorted.filter(
        (p) =>
          !p.is_archive &&
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
  }, [projectsData, settings, searchNameParam]);

  return { ...projectsData, ...filteredProjects };
};

// Filter courses by current and past
export const useCurrentAndPastCourses = ({
  searchNameParam,
}: {
  searchNameParam?: string;
} = {}) => {
  const coursesData = useGetAllCoursesQuery();
  const { data: settings } = useGetSettingsQuery();

  const filteredCourses = useMemo(() => {
    const CURRENT_YEAR = settings?.current_year ?? dayjs().year();
    const CURRENT_SEM = settings?.current_sem ?? 1;

    if (coursesData.isError || coursesData.isLoading) {
      return undefined;
    }

    const coursesFilteredByName = searchNameParam
      ? (coursesData.data as Course[]).filter((c) =>
          c.cname?.toLowerCase().includes(searchNameParam.toLocaleLowerCase()),
        )
      : (coursesData.data as Course[]);

    // Sort by course year and sem, then course name
    const coursesSorted = [...coursesFilteredByName].sort((a, b) => {
      if (a.shadow_course !== b.shadow_course) {
        return a.shadow_course ? -1 : 1;
      }
      if (!a.shadow_course && !b.shadow_course) {
        if (a.startYear !== b.startYear) {
          return a.startYear - b.startYear;
        }
        if (a.startSem !== b.startSem) {
          return a.startSem - b.startSem;
        }

        // Sort by course name
        if (a.cname !== b.cname) {
          return a.cname.localeCompare(b.cname);
        }
      }
      // Sort by course code
      return a.code.localeCompare(b.code);
    });

    return {
      pastCourses: coursesSorted.filter((c) =>
        isPast(c.startYear, c.startSem, c.endYear, c.endSem, CURRENT_YEAR, CURRENT_SEM),
      ),
      currentCourses: coursesSorted.filter((c) =>
        isCurrent(c.startYear, c.startSem, c.endYear, c.endSem, CURRENT_YEAR, CURRENT_SEM),
      ),
      futureCourses: coursesSorted.filter((c) =>
        isFuture(c.startYear, c.startSem, c.endYear, c.endSem, CURRENT_YEAR, CURRENT_SEM),
      ),
    };
  }, [coursesData, settings, searchNameParam]);

  return { ...coursesData, ...filteredCourses };
};

// Get project information by id
export function useProject(projectId: number) {
  const { data: project, isLoading: isProjectsLoading } = useGetProjectQuery({ id: projectId });
  const { data: userRoles } = useGetProjectUserRolesQuery(projectId);

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
  const { data: courses, isLoading: isCoursesLoading } = useGetAllCoursesQuery();
  const { data: projects } = useGetAllProjectsQuery();

  const [removeUser] = useRemoveCourseUserMutation();
  const [addUser] = useAddCourseUserMutation();
  const [updateUserCourseRole] = useUpdateCourseUserRoleMutation();
  const [deleteMilestone] = useDeleteMilestoneMutation();
  const [updateMilestone] = useUpdateMilestoneMutation();
  const { data: userRoles } = useGetCourseUserRolesQuery(courseIdNumber ?? skipToken);

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
    if (!courses || courses.length === 0 || !courseIdNumber) {
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
