import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { rest } from 'msw';
import { BrowserRouter } from 'react-router-dom';
import '../../mocks/antd';

import UserManagement from './UserManagement';
import store from '../../app/store';
import trofosApiSlice from '../../api';
import server from '../../mocks/server';
import { Role, User } from '../../api/types';

const BASE_URL = 'http://localhost:3001/api';

describe('test UserManagement', () => {
  beforeAll(() => server.listen());
  beforeEach(() => {
    // The `store` import is a shared singleton across every test in this file
    // (and across other test files), so a prior test's RTK Query cache (e.g. a
    // getUsers result reflecting a deletion) would otherwise leak into the next
    // test's fresh render. Reset at the start of each test, once the previous
    // test's component tree has already been unmounted by the global
    // `afterEach(cleanup)` in setupTests.ts, so there's no still-mounted
    // subscriber left to react to the cache clear.
    store.dispatch(trofosApiSlice.util.resetApiState());
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const users: User[] = [
    {
      user_email: 'first@test.com',
      user_display_name: 'First User',
      user_id: 1,
      projects: [],
      basicRoles: [{ user_email: 'first@test.com', role_id: 3 }],
      courses: [],
    },
    {
      user_email: 'second@test.com',
      user_display_name: 'Second User',
      user_id: 2,
      projects: [],
      basicRoles: [{ user_email: 'second@test.com', role_id: 2 }],
      courses: [],
    },
    {
      user_email: 'third@test.com',
      user_display_name: 'Third User',
      user_id: 3,
      projects: [],
      basicRoles: [{ user_email: 'third@test.com', role_id: 2 }],
      courses: [],
    },
  ];

  const roles: Role[] = [
    { role_name: 'Faculty', id: 1 },
    { role_name: 'Student', id: 2 },
    { role_name: 'Admin', id: 3 },
  ];

  const setup = async (deleteHandler = rest.delete(`${BASE_URL}/user/:userId`, (req, res, ctx) => res(ctx.status(200)))) => {
    server.use(
      rest.get(`${BASE_URL}/user/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify(users)))),
      rest.get(`${BASE_URL}/role/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify(roles)))),
      deleteHandler,
    );

    const { container } = render(
      <BrowserRouter>
        <Provider store={store}>
          <UserManagement />
        </Provider>
      </BrowserRouter>,
    );

    await screen.findByText('First User', {}, { timeout: 10000 });
    return { container };
  };

  it('renders row-selection checkboxes in the user table', async () => {
    const { container } = await setup();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.ant-table-selection-column').length).toBeGreaterThan(0);
  }, 15000);

  it('disables the Delete Selected button when no rows are selected', async () => {
    await setup();
    expect(screen.getByRole('button', { name: /delete selected/i })).toBeDisabled();
  }, 15000);

  it('enables Delete Selected once a row is checked, and deletes the selected user on confirm', async () => {
    // A stateful GET handler so the post-deletion refetch reflects the removal,
    // the same way the real backend would.
    let remainingUsers = [...users];
    server.use(
      rest.get(`${BASE_URL}/user/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify(remainingUsers)))),
      rest.get(`${BASE_URL}/role/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify(roles)))),
      rest.delete(`${BASE_URL}/user/:userId`, (req, res, ctx) => {
        const { userId } = req.params;
        remainingUsers = remainingUsers.filter((u) => u.user_id !== Number(userId));
        return res(ctx.status(200));
      }),
    );

    const { container } = render(
      <BrowserRouter>
        <Provider store={store}>
          <UserManagement />
        </Provider>
      </BrowserRouter>,
    );
    await screen.findByText('First User', {}, { timeout: 10000 });

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const rowCheckbox = container.querySelector(
      '.ant-table-tbody .ant-table-selection-column input[type="checkbox"]',
    ) as HTMLElement;
    fireEvent.click(rowCheckbox);

    const deleteButton = screen.getByRole('button', { name: /delete selected/i });
    expect(deleteButton).toBeEnabled();
    fireEvent.click(deleteButton);

    const confirmButton = await screen.findByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(screen.queryByText('First User')).not.toBeInTheDocument());
    expect(screen.getByText('Second User')).toBeInTheDocument();
  }, 15000);

  it('deletes every selected user when multiple rows are selected', async () => {
    let remainingUsers = [...users];
    const deletedIds: number[] = [];
    server.use(
      rest.get(`${BASE_URL}/user/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify(remainingUsers)))),
      rest.get(`${BASE_URL}/role/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify(roles)))),
      rest.delete(`${BASE_URL}/user/:userId`, (req, res, ctx) => {
        const userId = Number(req.params.userId);
        deletedIds.push(userId);
        remainingUsers = remainingUsers.filter((u) => u.user_id !== userId);
        return res(ctx.status(200));
      }),
    );

    const { container } = render(
      <BrowserRouter>
        <Provider store={store}>
          <UserManagement />
        </Provider>
      </BrowserRouter>,
    );
    await screen.findByText('First User', {}, { timeout: 10000 });

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const rowCheckboxes = container.querySelectorAll(
      '.ant-table-tbody .ant-table-selection-column input[type="checkbox"]',
    );
    fireEvent.click(rowCheckboxes[0]); // First User
    fireEvent.click(rowCheckboxes[1]); // Second User

    fireEvent.click(screen.getByRole('button', { name: /delete selected/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.queryByText('First User')).not.toBeInTheDocument());
    expect(screen.queryByText('Second User')).not.toBeInTheDocument();
    expect(screen.getByText('Third User')).toBeInTheDocument();
    expect(deletedIds.sort()).toEqual([1, 2]);
  }, 15000);

  it('reports a partial failure, keeps the user that failed to delete, and clears the selection either way', async () => {
    let remainingUsers = [...users];
    server.use(
      rest.get(`${BASE_URL}/user/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify(remainingUsers)))),
      rest.get(`${BASE_URL}/role/`, (req, res, ctx) => res(ctx.status(200), ctx.body(JSON.stringify(roles)))),
      rest.delete(`${BASE_URL}/user/:userId`, (req, res, ctx) => {
        const userId = Number(req.params.userId);
        // Second User's delete fails server-side; First User's succeeds.
        if (userId === 2) {
          return res(ctx.status(500), ctx.body(JSON.stringify({ error: 'db error' })));
        }
        remainingUsers = remainingUsers.filter((u) => u.user_id !== userId);
        return res(ctx.status(200));
      }),
    );

    const { container } = render(
      <BrowserRouter>
        <Provider store={store}>
          <UserManagement />
        </Provider>
      </BrowserRouter>,
    );
    await screen.findByText('First User', {}, { timeout: 10000 });

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const rowCheckboxes = container.querySelectorAll(
      '.ant-table-tbody .ant-table-selection-column input[type="checkbox"]',
    );
    fireEvent.click(rowCheckboxes[0]); // First User (will succeed)
    fireEvent.click(rowCheckboxes[1]); // Second User (will fail)

    fireEvent.click(screen.getByRole('button', { name: /delete selected/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

    // The one that succeeded is gone; the one that failed is still there.
    await waitFor(() => expect(screen.queryByText('First User')).not.toBeInTheDocument());
    expect(screen.getByText('Second User')).toBeInTheDocument();

    // Selection is cleared either way, so a stale retry can't re-target an
    // already-deleted id: the button goes back to disabled.
    await waitFor(() => expect(screen.getByRole('button', { name: /delete selected/i })).toBeDisabled());
  }, 25000);
});
