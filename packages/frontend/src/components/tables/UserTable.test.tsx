import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { UserData } from '../../api/types';
import UserTable from './UserTable';
import store from '../../app/store';

describe('test UserTable', () => {
  const mockUsers: UserData[] = [
    {
      user: {
        user_email: 'email',
        user_display_name: "Test User",
        user_id: 999,
        courseRoles: [
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
      <UserTable users={mockUsers} userRoles={undefined} actionsOnRoles={undefined} isLoading={false} />,
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

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
