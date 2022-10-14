import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';
import UserTable from './UserTable';
import store from '../../app/store';
import server from '../../mocks/server';
import { User } from '../../api/types';

describe('test UserTable', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const users : User[] = [
    {
        user_email : "testEmail@test.com",
        user_id : 1,
        projects: [],
        courses: [],
        roles: [],
    },
  ];

  const setup = () => {
    const { baseElement, debug } = render(
      <BrowserRouter>
        <Provider store={store}>
          <UserTable users={users}/>
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