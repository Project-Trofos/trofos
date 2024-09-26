import React, { useCallback } from 'react';
import { Card, Space, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../../api/auth';
import { useGetActionsOnRolesQuery } from '../../api/role';
import { useProject } from '../../api/hooks';
import InputWithButton from '../../components/fields/InputWithButton';
import Container from '../../components/layouts/Container';
import UserTable from '../../components/tables/UserTable';
import InviteTable from '../../components/tables/InviteTable';
import { confirmInviteUserToProject } from '../../components/modals/confirm';
import { getErrorMessage } from '../../helpers/error';
import { useFindUserByEmailMutation } from '../../api/user';
import { useSendProjectInvitationMutation, useGetInfoFromProjectIdQuery } from '../../api/invite';
import { validateEmailPattern } from '../../helpers/validation';
import { useIsCourseManager } from '../../api/hooks/roleHooks';
import { UserPermissionActions } from '../../helpers/constants';

export default function ProjectPeople(): JSX.Element {
  const params = useParams();
  const { project, projectUserRoles, handleAddUser, handleRemoveUser, handleUpdateUserRole, isLoading, course } =
    useProject(Number(params.projectId) ? Number(params.projectId) : -1);
  const { data: userInfo } = useGetUserInfoQuery();
  const { data: actionsOnRoles } = useGetActionsOnRolesQuery();
  const { data: invites } = useGetInfoFromProjectIdQuery(Number(params.projectId) ? Number(params.projectId) : -1);
  const [findUserByEmail] = useFindUserByEmailMutation();
  const [sendProjectInvitation] = useSendProjectInvitationMutation();

  const { isCourseManager } = useIsCourseManager(course?.id);

  const myRoleId = projectUserRoles?.find((pur) => pur.user_id === userInfo?.userId)?.role_id;
  const iAmAdmin = userInfo?.userRoleActions.includes(UserPermissionActions.ADMIN);
  const isAllowedUpdateUser =
    actionsOnRoles
      ?.find((aor) => aor.id === myRoleId)
      ?.actions?.find((act) => act.action === UserPermissionActions.UPDATE_PROJECT_USERS) || iAmAdmin;
  const isAllowedInviteUser = false; // TODO: setup permission action

  const sendEmail = useCallback(
    async (destEmail: string) => {
      if (!project || !userInfo) {
        return;
      }

      try {
        await sendProjectInvitation({
          projectId: project.id,
          senderName: userInfo.userDisplayName,
          senderEmail: userInfo.userEmail,
          destEmail: destEmail,
        }).unwrap();

        message.success(`Invite sent`);
      } catch (error) {
        message.error(getErrorMessage(error));
      }
    },
    [project, userInfo],
  );

  const handleOnClick = async (userEmail: string) => {
    try {
      validateEmailPattern(userEmail);

      const res = await findUserByEmail(userEmail).unwrap();

      if (!res.exists) {
        confirmInviteUserToProject(async () => {
          await sendEmail(userEmail);
        });

        return;
      }

      if (project) {
        if (project.users.some((u) => u.user.user_email === userEmail)) {
          message.error('User already in this course!');
          return;
        }
        await sendEmail(userEmail);
      }
    } catch (err) {
      message.error(getErrorMessage(err));
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
            hideIdByRoleProp={{
              iAmAdmin: iAmAdmin,
              isHideIdByRole: true,
            }}
            control={
              isAllowedUpdateUser ? (
                <InputWithButton handleClick={handleAddUser} buttonText="Add" inputPlaceholder="Add user by email" />
              ) : (
                isAllowedInviteUser && (
                  <InputWithButton
                    handleClick={handleOnClick}
                    buttonText="Invite"
                    inputPlaceholder="Invite user by email"
                  />
                )
              )
            }
            handleRemoveUser={isAllowedUpdateUser ? handleRemoveUser : undefined}
            handleUpdateUserRole={isCourseManager ? handleUpdateUserRole : undefined}
            onlyShowActions={isCourseManager ? undefined : isAllowedUpdateUser ? ['REMOVE', 'ROLE'] : ['ROLE']}
          />
        </Card>
        {(isAllowedInviteUser || iAmAdmin) && (
          <Card>
            <InviteTable userInfo={userInfo} invites={invites} onResendInvite={sendEmail} />
          </Card>
        )}
      </Space>
    </Container>
  );
}
