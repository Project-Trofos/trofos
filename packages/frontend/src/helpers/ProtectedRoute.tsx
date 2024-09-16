import React from 'react';
import { Spin, Empty } from 'antd';
import { useParams } from 'react-router-dom';
import { useCourseActions } from '../api/hooks/roleHooks';
import Container from '../components/layouts/Container';
import { canDisplay } from './conditionalRender';
import { COURSE_MANAGER_ACTIONS, UserPermissionActions, MANAGE_API_KEY_ACTIONS } from './constants';
import { useGetUserInfoQuery } from '../api/auth';

/**
 * A react component that protects a route against users who are not course manager.
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
 * A react component that protects a route against users who are not admins.
 */
export function AdminProtected({ children }: { children: JSX.Element }): JSX.Element {
  const { data: userInfo, isLoading } = useGetUserInfoQuery();

  const isAdmin = canDisplay(userInfo?.userRoleActions || [], [UserPermissionActions.ADMIN]);

  if (isLoading) {
    return <Spin />;
  }

  if (!isAdmin) {
    return (
      <Container>
        <Empty description="You are not authorized to view this page!" />
      </Container>
    );
  }

  return children;
}

/**
 * A react component that protects a route against users who cannot manage api key
 */
export function ApiKeyManagerProtected({ children }: { children: JSX.Element }): JSX.Element {
  const { data: userInfo, isLoading } = useGetUserInfoQuery();

  const canManageApiKey = canDisplay(userInfo?.userRoleActions || [], MANAGE_API_KEY_ACTIONS);

  if (isLoading) {
    return <Spin />;
  }

  if (!canManageApiKey) {
    return (
      <Container>
        <Empty description="You are not authorized to view this page!" />
      </Container>
    );
  }

  return children;
}
