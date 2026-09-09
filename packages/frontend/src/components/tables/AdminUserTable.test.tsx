import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  type UserWithUsage = User & { api_usages?: { timestamp: string }[] };

  const users: UserWithUsage[] = [
    {
      user_email: 'testEmail@test.com',
      user_display_name: 'Test User',
      user_id: 1,
      projects: [],
      basicRoles: [
        {
          user_email: 'testEmail@test.com',
          role_id: 1,
        },
      ],
      courses: [],
      // No api_usages: this user has never logged in, renders "Never".
    },
    {
      user_email: 'secondEmail@test.com',
      user_display_name: 'Second User',
      user_id: 2,
      projects: [
        {
          id: 1,
          pname: 'Sample Project',
          pkey: null,
          description: null,
          course_id: null,
          public: false,
          created_at: '2026-01-01T00:00:00.000Z',
          is_archive: false,
        },
      ],
      basicRoles: [
        {
          user_email: 'secondEmail@test.com',
          role_id: 1,
        },
      ],
      courses: [],
      api_usages: [{ timestamp: '2026-02-03T12:00:00.000Z' }],
    },
  ];

  const roles: Role[] = [
    {
      role_name: 'testEmail@test.com',
      id: 1,
    },
  ];

  const setup = () => {
    const { baseElement, debug, container } = render(
      <BrowserRouter>
        <Provider store={store}>
          <AdminUserTable users={users} roles={roles} />
        </Provider>
      </BrowserRouter>,
    );
    return { baseElement, debug, container };
  };

  const headerFor = (container: HTMLElement, text: string) =>
    Array.from(container.querySelectorAll('.ant-table-thead th')).find((th) =>
      th.textContent?.includes(text),
    );

  const rowTexts = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.ant-table-tbody tr')).map((tr) => tr.textContent || '');

  it('should render table with correct fields', () => {
    const { baseElement } = setup();

    // Ensure columns are present
    expect(screen.getByText('User ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Both seeded users should render
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Second User')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('User ID, Name, Email, Projects and Last Active are sortable; Actions is not', () => {
    const { container } = setup();

    expect(headerFor(container, 'User ID')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Name')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Email')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Projects')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Last Active')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Actions')?.classList.contains('ant-table-column-has-sorters')).toBe(false);
  });

  it('only Last Active has a filter trigger', () => {
    const { container } = setup();

    expect(headerFor(container, 'User ID')?.querySelector('.ant-table-filter-trigger')).not.toBeInTheDocument();
    expect(headerFor(container, 'Name')?.querySelector('.ant-table-filter-trigger')).not.toBeInTheDocument();
    expect(headerFor(container, 'Email')?.querySelector('.ant-table-filter-trigger')).not.toBeInTheDocument();
    expect(headerFor(container, 'Projects')?.querySelector('.ant-table-filter-trigger')).not.toBeInTheDocument();
    expect(headerFor(container, 'Last Active')?.querySelector('.ant-table-filter-trigger')).toBeInTheDocument();
    expect(headerFor(container, 'Actions')?.querySelector('.ant-table-filter-trigger')).not.toBeInTheDocument();
  });

  it('clicking the User ID header sorts rows ascending by id, then descending on a second click', () => {
    const { container } = setup();
    const header = headerFor(container, 'User ID') as Element;

    // Default order is insertion order: user_id 1, then 2.
    expect(rowTexts(container)[0]).toContain('Test User');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    expect(rowTexts(container)[0]).toContain('Test User'); // id 1 is already first ascending

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(rowTexts(container)[0]).toContain('Second User'); // id 2 first descending
  });

  it('clicking the Name header sorts rows alphabetically by display name', () => {
    const { container } = setup();
    const header = headerFor(container, 'Name') as Element;

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    // 'Second User' sorts before 'Test User' alphabetically.
    expect(rowTexts(container)[0]).toContain('Second User');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(rowTexts(container)[0]).toContain('Test User');
  });

  it('clicking the Email header sorts rows alphabetically by email', () => {
    const { container } = setup();
    const header = headerFor(container, 'Email') as Element;

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    // 'secondEmail@test.com' sorts before 'testEmail@test.com' alphabetically.
    expect(rowTexts(container)[0]).toContain('Second User');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(rowTexts(container)[0]).toContain('Test User');
  });

  it('clicking the Projects header sorts rows by project count', () => {
    const { container } = setup();
    const header = headerFor(container, 'Projects') as Element;

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    // Test User has 0 projects, sorts first ascending.
    expect(rowTexts(container)[0]).toContain('Test User');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    // Second User has 1 project, sorts first descending.
    expect(rowTexts(container)[0]).toContain('Second User');
  });

  it('clicking the Last Active header sorts rows by last-usage time', () => {
    const { container } = setup();
    const header = headerFor(container, 'Last Active') as Element;

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    // Test User has no usage (treated as time 0), sorts first ascending.
    expect(rowTexts(container)[0]).toContain('Test User');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    // Second User has a real timestamp, sorts first descending.
    expect(rowTexts(container)[0]).toContain('Second User');
  });

  it('filtering Last Active by "Never Logged In" via the checkbox filter narrows the table', async () => {
    const { container } = setup();

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Second User')).toBeInTheDocument();

    const header = headerFor(container, 'Last Active') as Element;
    const filterTrigger = header.querySelector('.ant-table-filter-trigger');
    expect(filterTrigger).toBeInTheDocument();

    fireEvent.click(filterTrigger as Element);

    const neverOption = await screen.findByText('Never Logged In');
    const checkbox = neverOption.closest('li')?.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox as Element);

    const okButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.click(okButton);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.queryByText('Second User')).not.toBeInTheDocument();
  });
});
