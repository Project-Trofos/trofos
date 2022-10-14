import React from 'react';
import { Space } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../api/auth';
import { useProject } from '../api/hooks';
import InputWithButton from '../components/fields/InputWithButton';
import Container from '../components/layouts/Container';
import UserTable from '../components/tables/UserTable';

export default function ProjectPeople(): JSX.Element {
  const params = useParams();
  const { project, handleAddUser, handleRemoveUser, isLoading } = useProject(
    Number(params.projectId) ? Number(params.projectId) : -1,
  );
  const { data: userInfo } = useGetUserInfoQuery();

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%' }}>
        <UserTable
          users={project?.users}
          isLoading={isLoading}
          myUserId={userInfo?.userId}
          control={
            <InputWithButton
              handleClick={(v) => handleAddUser(Number(v))}
              buttonText="Add"
              inputPlaceholder="Add user by id"
            />
          }
          handleRemoveUser={handleRemoveUser}
        />
      </Space>
    </Container>
  );
}
