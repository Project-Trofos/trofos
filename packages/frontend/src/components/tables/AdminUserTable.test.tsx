import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';
import AdminUserTable from './AdminUserTable';
import store from '../../app/store';
import server from '../../mocks/server';
import { Role, User } from '../../api/types';

describe('test UserTable', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const users: User[] = [
    {
      user_email: 'testEmail@test.com',
      user_display_name: 'Test User',
      user_id: 1,
      projects: [],
      courses: [],
      basicRoles: [
        {
          user_email: 'testEmail@test.com',
          role_id: 1,
        },
      ],
      courseRoles: [],
    },
  ];

  const roles: Role[] = [
    {
      role_name: 'testEmail@test.com',
      id: 1,
    },
  ];

  const setup = () => {
    const { baseElement, debug } = render(
      <BrowserRouter>
        <Provider store={store}>
          <AdminUserTable users={users} roles={roles} />
        </Provider>
      </BrowserRouter>,
    );
    return { baseElement, debug };
  };

  it('should render table with correct fields', () => {
    const { baseElement } = setup();

    // Ensure columns are present
    expect(screen.getByText('User ID')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
