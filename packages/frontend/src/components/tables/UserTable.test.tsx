import React from 'react';
import { render, screen } from '@testing-library/react';

import { UserData, UserOnRolesOnCourse } from '../../api/types';
import UserTable from './UserTable';
import { FACULTY_ROLE_ID, STUDENT_ROLE_ID } from '../../api/role';

describe('test UserTable', () => {
  const mockUsers: UserData[] = [
    {
      user: {
        user_email: 'email',
        user_display_name: 'Test User',
        user_id: 999,
        courses: [
          {
            id: 1,
            user_email: 'email',
            role_id: 1,
            course_id: 1,
          },
        ],
      },
    },
  ];

  const setup = () => {
    const { baseElement, debug } = render(
      <UserTable
        heading="People"
        users={mockUsers}
        userRoles={undefined}
        actionsOnRoles={undefined}
        isLoading={false}
      />,
    );
    return { baseElement, debug };
  };

  it('should render table with correct fields', () => {
    const { baseElement } = setup();

    expect(screen.getByText('People')).toBeInTheDocument();

    // Ensure columns are present
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].user.user_id)).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].user.user_email)).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should render table without ID when hideIdByRoleProp is set and I am student', () => {
    const mockUserRoles: UserOnRolesOnCourse[] = [
      {
        id: 1,
        role_id: STUDENT_ROLE_ID,
        user_id: 999, // from mockData
        course_id: 1,
        role: {
          id: STUDENT_ROLE_ID,
          role_name: 'Student',
        }
      },
    ];
    const { baseElement } = render(
      <UserTable
        heading="People"
        users={mockUsers}
        userRoles={mockUserRoles}
        isLoading={false}
        hideIdByRoleProp={{
          iAmAdmin: false,
          isHideIdByRole: true,
        }}
        myUserId={999}
      />
    );
    // dont expect ID to be in document
    expect(screen.queryByText('ID')).toBeNull();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].user.user_email)).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
  });

  it('should render table with ID when hideIdByRoleProp is set and I am faculty', () => {
    const mockUserRoles: UserOnRolesOnCourse[] = [
      {
        id: 1,
        role_id: FACULTY_ROLE_ID,
        user_id: 999, // from mockData
        course_id: 1,
        role: {
          id: FACULTY_ROLE_ID,
          role_name: 'Faculty',
        }
      },
    ];
    const { baseElement } = render(
      <UserTable
        heading="People"
        users={[
          {
            user: {
              user_email: 'email',
              user_display_name: 'Test User',
              user_id: 999,
              courses: [
                {
                  id: 1,
                  user_email: 'email',
                  role_id: FACULTY_ROLE_ID,
                  course_id: 1,
                },
              ],
            },
          },
        ]}
        userRoles={mockUserRoles}
        isLoading={false}
        hideIdByRoleProp={{
          iAmAdmin: false,
          isHideIdByRole: true,
        }}
        myUserId={999}
      />
    );
    // expect ID to be in document
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].user.user_id)).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].user.user_email)).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Faculty')).toBeInTheDocument();
  });

  it('should render table with ID when hideIdByRoleProp is set and I am admin', () => {
    const mockUserRoles: UserOnRolesOnCourse[] = [
      {
        id: 1,
        role_id: STUDENT_ROLE_ID,
        user_id: 999, // from mockData
        course_id: 1,
        role: {
          id: STUDENT_ROLE_ID,
          role_name: 'Student',
        }
      },
    ];
    const { baseElement } = render(
      <UserTable
        heading="People"
        users={mockUsers}
        userRoles={mockUserRoles}
        isLoading={false}
        hideIdByRoleProp={{
          iAmAdmin: true,
          isHideIdByRole: true,
        }}
      />
    );
    // expect ID to be in document
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].user.user_id)).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].user.user_email)).toBeInTheDocument();
  });
});
