import React from 'react';
import { Card, Space } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../../api/auth';
import { useGetActionsOnRolesQuery } from '../../api/role';
import { useProject } from '../../api/hooks';
import InputWithButton from '../../components/fields/InputWithButton';
import Container from '../../components/layouts/Container';
import UserTable from '../../components/tables/UserTable';
import { useIsCourseManager } from '../../api/hooks/roleHooks';
import { UserPermissionActions } from '../../helpers/constants';

export default function ProjectPeople(): JSX.Element {
  const params = useParams();
  const { project, projectUserRoles, handleAddUser, handleRemoveUser, handleUpdateUserRole, isLoading } = useProject(
    Number(params.projectId) ? Number(params.projectId) : -1,
  );
  const { data: userInfo } = useGetUserInfoQuery();
  const { data: actionsOnRoles } = useGetActionsOnRolesQuery();
  const { isCourseManager } = useIsCourseManager();
  
  const myRoleId = projectUserRoles?.find((pur) => pur.user_id === userInfo?.userId)?.role_id;
  const iAmAdmin = userInfo?.userRoleActions.includes(UserPermissionActions.ADMIN);
  const isAllowedRemoveUser = actionsOnRoles?.find((aor) => aor.id === myRoleId)
    ?.actions.includes({action: UserPermissionActions.UPDATE_PROJECT_USERS}) || iAmAdmin;

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
              isHideIdByRole: true
            }}
            control={
              <InputWithButton
                handleClick={(v) => handleAddUser(v)}
                buttonText="Add"
                inputPlaceholder="Add user by email"
              />
            }
            handleRemoveUser={isAllowedRemoveUser ? handleRemoveUser : undefined}
            handleUpdateUserRole={isCourseManager ? handleUpdateUserRole : undefined}
            onlyShowActions={isCourseManager ? undefined : isAllowedRemoveUser ? ["REMOVE", "ROLE"] : ["ROLE"]}
          />
        </Card>
      </Space>
    </Container>
  );
}
