import { SkipToken, skipToken } from '@reduxjs/toolkit/dist/query';
import { useParams } from 'react-router-dom';
import { canDisplay } from '../../helpers/conditionalRender';
import { COURSE_MANAGER_ACTIONS } from '../../helpers/constants';
import { useGetUserInfoQuery } from '../auth';
import { useGetActionsOnRolesQuery, useGetCourseUserRolesQuery, useGetProjectUserRolesQuery } from '../role';
import { UserOnRolesOnCourse } from '../types';

/**
 * A hook to return all actions that a user can perform for a course.
 *
 * @param courseId
 * @returns actions for the current user
 */
export function useCourseActions({ courseId }: { courseId: number | undefined }) {
  return useActionHookHOF({ id: courseId, useGetUserRoleQuery: useGetCourseUserRolesQuery });
}

/**
 * A hook to return all actions that a user can perform for a project.
 *
 * @param courseId
 * @returns actions for the current user
 */
export function useProjectActions({ projectId }: { projectId: number | undefined }) {
  return useActionHookHOF({ id: projectId, useGetUserRoleQuery: useGetProjectUserRolesQuery });
}

/**
 * Create a hook for getting user actions, given a id and a user role query hook.
 */
function useActionHookHOF({
  id,
  useGetUserRoleQuery,
}: {
  id: number | undefined;
  useGetUserRoleQuery: (input: number | SkipToken) => { data?: UserOnRolesOnCourse[] | undefined; isLoading: boolean };
}) {
  const { data: userInfo } = useGetUserInfoQuery();
  // TODO (Luoyi): Use API for fetching user actions
  const { data: roles, isLoading: isGetUserRoleQueryLoading } = useGetUserRoleQuery(id ?? skipToken);
  const { data: actionOnRoles, isLoading: isActionsOnRolesLoading } = useGetActionsOnRolesQuery();
  const actions: string[] = Array.from(
    new Set([
      ...(roles
        ?.filter((r) => r.user_id === userInfo?.userId)
        .flatMap(
          (r) => actionOnRoles?.find((a) => a.id === r.role_id)?.actions.flatMap((action) => action.action) ?? [],
        ) ?? []),
      // Add admin action from basic role action if applicable
      ...(userInfo?.userRoleActions.includes('admin') ? ['admin'] : []),
    ]),
  );

  return { actions, isLoading: isGetUserRoleQueryLoading || isActionsOnRolesLoading };
}

/**
 * Returns a flag whether the current user is a course manager.
 */
export function useIsCourseManager(courseId?: number) {
  const params = useParams();
  const cid = courseId ?? Number(params.courseId);
  const { actions } = useCourseActions({ courseId: cid });

  const isCourseManager = canDisplay(actions || [], COURSE_MANAGER_ACTIONS);

  return { isCourseManager };
}
