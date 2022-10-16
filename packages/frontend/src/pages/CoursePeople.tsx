import React from 'react';
import { Space } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetUserInfoQuery } from '../api/auth';
import { useCourse } from '../api/hooks';
import InputWithButton from '../components/fields/InputWithButton';
import Container from '../components/layouts/Container';
import UserTable from '../components/tables/UserTable';

export default function CoursePeople(): JSX.Element {
  const params = useParams();
  const { course, handleAddUser, handleRemoveUser, isLoading } = useCourse(params.courseId);
  const { data: userInfo } = useGetUserInfoQuery();

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%' }}>
        <UserTable
          users={course?.users}
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
