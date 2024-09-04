import React from 'react';
import { Card, Space } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../../api/auth';
import { ADMIN_ROLE_ID, useGetActionsOnRolesQuery } from '../../api/role';
import { useProject } from '../../api/hooks';
import InputWithButton from '../../components/fields/InputWithButton';
import Container from '../../components/layouts/Container';
import UserTable from '../../components/tables/UserTable';

export default function ProjectPeople(): JSX.Element {
  const params = useParams();
  const { project, projectUserRoles, handleAddUser, handleRemoveUser, handleUpdateUserRole, isLoading } = useProject(
    Number(params.projectId) ? Number(params.projectId) : -1,
  );
  const { data: userInfo } = useGetUserInfoQuery();
  const { data: actionsOnRoles } = useGetActionsOnRolesQuery();

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
            iAmAdmin={userInfo?.userRoleActions.includes('admin')}
            control={
              <InputWithButton
                handleClick={(v) => handleAddUser(v)}
                buttonText="Add"
                inputPlaceholder="Add user by email"
              />
            }
            handleRemoveUser={handleRemoveUser}
            handleUpdateUserRole={handleUpdateUserRole}
          />
        </Card>
      </Space>
    </Container>
  );
}
