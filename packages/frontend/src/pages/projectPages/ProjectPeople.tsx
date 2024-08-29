import React from 'react';
import { Card, Space, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../../api/auth';
import { useGetActionsOnRolesQuery } from '../../api/role';
import { useProject } from '../../api/hooks';
import InputWithButton from '../../components/fields/InputWithButton';
import Container from '../../components/layouts/Container';
import UserTable from '../../components/tables/UserTable';
import { confirmAddUserToProject } from '../../components/modals/confirm';
import { getErrorMessage } from '../../helpers/error';
import { useFindUserByEmailMutation } from '../../api/user';

export default function ProjectPeople(): JSX.Element {
  const params = useParams();
  const { project, projectUserRoles, handleAddUser, handleRemoveUser, handleUpdateUserRole, isLoading } = useProject(
    Number(params.projectId) ? Number(params.projectId) : -1,
  );
  const { data: userInfo } = useGetUserInfoQuery();
  const { data: actionsOnRoles } = useGetActionsOnRolesQuery();
  const [findUserByEmail] = useFindUserByEmailMutation();

  const sendEmail = async (destEmail: string) => {
    message.success(`Sent registration invite to ${destEmail}`);
    const didAccept = true;

    if (didAccept) {
      await handleAddUser(destEmail);
    }
  };

  const handleOnClick = async (userEmail: string) => {
    const queryUser = await findUserByEmail(userEmail).unwrap();

    if (queryUser == null) {
      try {
        confirmAddUserToProject(async () => {
          await sendEmail(userEmail);
        });
      } catch (err) {
        message.error(getErrorMessage(err));
      }

      return;
    }

    if (project) {
      if (project.users.some((u) => u.user.user_email === userEmail)) {
        message.error('User already in this course!');
        return;
      }
      await sendEmail(userEmail);
    }
  };

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
            control={
              <InputWithButton handleClick={handleOnClick} buttonText="Add" inputPlaceholder="Add user by email" />
            }
            handleRemoveUser={handleRemoveUser}
            handleUpdateUserRole={handleUpdateUserRole}
          />
        </Card>
      </Space>
    </Container>
  );
}
