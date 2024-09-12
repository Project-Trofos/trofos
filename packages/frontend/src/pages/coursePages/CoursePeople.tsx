import React from 'react';
import { Card, Space } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../../api/auth';
import { useGetActionsOnRolesQuery } from '../../api/role';
import { useCourse } from '../../api/hooks';
import InputWithButton from '../../components/fields/InputWithButton';
import Container from '../../components/layouts/Container';
import UserTable from '../../components/tables/UserTable';
import { useIsCourseManager } from '../../api/hooks/roleHooks';
import { UserPermissionActions } from '../../helpers/constants';

export default function CoursePeople(): JSX.Element {
  const params = useParams();
  const { course, courseUserRoles, handleAddUser, handleRemoveUser, handleUpdateUserRole, isLoading } = useCourse(
    params.courseId,
  );
  const { data: userInfo } = useGetUserInfoQuery();
  const { data: actionsOnRoles } = useGetActionsOnRolesQuery();
  const { isCourseManager } = useIsCourseManager();

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <UserTable
            heading="Users"
            users={course?.users}
            userRoles={courseUserRoles}
            actionsOnRoles={actionsOnRoles}
            isLoading={isLoading}
            myUserId={userInfo?.userId}
            hideIdByRoleProp={{
              iAmAdmin: userInfo?.userRoleActions.includes(UserPermissionActions.ADMIN),
              isHideIdByRole: true
            }}
            control={
              isCourseManager && (
                <InputWithButton
                  handleClick={(v) => handleAddUser(v)}
                  buttonText="Add"
                  inputPlaceholder="Add user by email"
                />
              )
            }
            handleRemoveUser={handleRemoveUser}
            handleUpdateUserRole={handleUpdateUserRole}
            onlyShowActions={isCourseManager ? undefined : []}
          />
        </Card>
      </Space>
    </Container>
  );
}
