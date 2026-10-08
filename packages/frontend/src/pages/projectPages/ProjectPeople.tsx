import React from 'react';
import { Card, Space } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../../api/auth';
import { useGetActionsOnRolesQuery } from '../../api/role';
import { useProject } from '../../api/hooks';
import Container from '../../components/layouts/Container';
import UserTable from '../../components/tables/UserTable';
import { useIsCourseManager } from '../../api/hooks/roleHooks';
import { UserPermissionActions } from '../../helpers/constants';
import { useGetFeatureFlagsQuery } from '../../api/featureFlag';
import ProjectInviteLinkModal from '../../components/modals/ProjectInviteLinkModal';

export default function ProjectPeople(): JSX.Element {
  const params = useParams();
  const { project, projectUserRoles, handleRemoveUser, handleUpdateUserRole, isLoading, course } = useProject(
    Number(params.projectId) ? Number(params.projectId) : -1,
  );
  const { data: userInfo } = useGetUserInfoQuery();
  const { data: actionsOnRoles } = useGetActionsOnRolesQuery();
  const { data: featureFlags } = useGetFeatureFlagsQuery();
  const { isCourseManager } = useIsCourseManager(course?.id);

  const myRoleId = projectUserRoles?.find((pur) => pur.user_id === userInfo?.userId)?.role_id;
  const iAmAdmin = userInfo?.userRoleActions.includes(UserPermissionActions.ADMIN);
  const allowableActions = actionsOnRoles?.find((aor) => aor.id === myRoleId)?.actions;
  const isAllowedRemoveUser =
    allowableActions?.find((act) => act.action === UserPermissionActions.UPDATE_PROJECT_USERS) || iAmAdmin;
  const isProjectInviteLinksEnabled = featureFlags?.some(
    (flag) => flag.feature_name === 'project_invite_links' && flag.active,
  );

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <UserTable
            heading="Users"
            users={project?.users}
            userRoles={projectUserRoles}
            actionsOnRoles={actionsOnRoles}
            isLoading={isLoading}
            myUserId={userInfo?.userId}
            hideIdByRoleProp={{
              iAmAdmin: iAmAdmin,
              isHideIdByRole: true,
            }}
            ownerId={project?.owner_id}
            control={
              <Space direction="horizontal">
                {isProjectInviteLinksEnabled && project && <ProjectInviteLinkModal projectId={project.id} />}
              </Space>
            }
            handleRemoveUser={isAllowedRemoveUser ? handleRemoveUser : undefined}
            handleUpdateUserRole={isCourseManager ? handleUpdateUserRole : undefined}
            onlyShowActions={isCourseManager ? undefined : isAllowedRemoveUser ? ['REMOVE', 'ROLE'] : ['ROLE']}
          />
        </Card>
      </Space>
    </Container>
  );
}
