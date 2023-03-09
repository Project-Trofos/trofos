import { Empty, Spin } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourseActions } from '../api/hooks/roleHooks';
import Container from '../components/layouts/Container';
import { UserPermissionActions, UserPermissionActionsType } from './constants';

export function canDisplay(userActions: string[], allowedActions: string[] | undefined) {
  return userActions?.filter((userAction) => allowedActions?.includes(userAction)).length !== 0;
}

function conditionalRender(
  componentToRender: any,
  userActions: string[],
  allowedActions: string[] | undefined,
  defaultComponent: any = null,
) {
  return canDisplay(userActions, allowedActions) ? componentToRender : defaultComponent;
}

const COURSE_MANAGER_ACTIONS: UserPermissionActionsType[] = [
  UserPermissionActions.ADMIN,
  UserPermissionActions.UPDATE_COURSE,
];

/**
 * A react component protect a route again users who are not course manager.
 * Course ID is derived from url parameter.
 */
export function CourseManagerProtected({ children }: { children: JSX.Element }): JSX.Element {
  const params = useParams();
  const cid = Number(params.courseId);
  const { actions, isLoading } = useCourseActions({ courseId: cid });

  const isCourseManager = canDisplay(actions || [], COURSE_MANAGER_ACTIONS);

  if (isLoading) {
    return <Spin />;
  }

  if (!isCourseManager) {
    return (
      <Container>
        <Empty description="You are not authorized to view this page!" />
      </Container>
    );
  }

  return children;
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

export default conditionalRender;
