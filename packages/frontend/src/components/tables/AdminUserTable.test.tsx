import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';
import '../../mocks/antd';
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
          role_id: 3,
        },
      ],
      courses: [],
      // No api_usages: this user has never logged in, renders "Never".
    },
    {
      user_email: 'secondEmail@test.com',
      user_display_name: 'Second User',
      user_id: 2,
      // Matches the real GET /user/ shape: a UsersOnProjects join row with a
      // nested `project`, not a bare Project (see packages/backend/src/services/user.service.ts).
      projects: [
        {
          project_id: 1,
          project: {
            id: 1,
            pname: 'Sample Project',
            pkey: null,
            description: null,
            course_id: null,
            public: false,
            created_at: '2026-01-01T00:00:00.000Z',
            is_archive: false,
          },
        },
      ],
      basicRoles: [
        {
          user_email: 'secondEmail@test.com',
          role_id: 2,
        },
      ],
      courses: [],
      api_usages: [{ timestamp: '2026-02-03T12:00:00.000Z' }],
    },
  ];

  const roles: Role[] = [
    { role_name: 'Faculty', id: 1 },
    { role_name: 'Student', id: 2 },
    { role_name: 'Admin', id: 3 },
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
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Both seeded users should render
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Second User')).toBeInTheDocument();

    // Role names render per-user
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('User ID, Name, Email, Role, Projects and Last Active are sortable; Actions is not', () => {
    const { container } = setup();

    expect(headerFor(container, 'User ID')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Name')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Email')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Role')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Projects')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Last Active')?.classList.contains('ant-table-column-has-sorters')).toBe(true);
    expect(headerFor(container, 'Actions')?.classList.contains('ant-table-column-has-sorters')).toBe(false);
  });

  it('Role and Last Active have a filter trigger; other columns do not', () => {
    const { container } = setup();

    expect(headerFor(container, 'User ID')?.querySelector('.ant-table-filter-trigger')).not.toBeInTheDocument();
    expect(headerFor(container, 'Name')?.querySelector('.ant-table-filter-trigger')).not.toBeInTheDocument();
    expect(headerFor(container, 'Email')?.querySelector('.ant-table-filter-trigger')).not.toBeInTheDocument();
    expect(headerFor(container, 'Role')?.querySelector('.ant-table-filter-trigger')).toBeInTheDocument();
    expect(headerFor(container, 'Projects')?.querySelector('.ant-table-filter-trigger')).toBeInTheDocument();
    expect(headerFor(container, 'Last Active')?.querySelector('.ant-table-filter-trigger')).toBeInTheDocument();
    expect(headerFor(container, 'Actions')?.querySelector('.ant-table-filter-trigger')).not.toBeInTheDocument();
  });

  it('clicking the Role header sorts rows alphabetically by role name', () => {
    const { container } = setup();
    const header = headerFor(container, 'Role') as Element;

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    // 'Admin' sorts before 'Student' alphabetically.
    expect(rowTexts(container)[0]).toContain('Test User');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(rowTexts(container)[0]).toContain('Second User');
  });

  it('filtering Role by Admin via the checkbox filter narrows the table', async () => {
    const { container } = setup();

    const header = headerFor(container, 'Role') as Element;
    const filterTrigger = header.querySelector('.ant-table-filter-trigger');
    fireEvent.click(filterTrigger as Element);

    const dropdown = await screen.findByRole('menu');
    const adminOption = await within(dropdown).findByText('Admin');
    const checkbox = adminOption.closest('li')?.querySelector('input[type="checkbox"]');
    fireEvent.click(checkbox as Element);

    const okButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.click(okButton);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.queryByText('Second User')).not.toBeInTheDocument();
  });

  it('clicking the User ID header sorts rows ascending by id, then descending on a second click', () => {
    const { container } = setup();
    const header = headerFor(container, 'User ID') as Element;

    // Before any click, the table is sorted by Last Active (descending) by default,
    // so Second User (real timestamp) renders before Test User (never active).
    expect(rowTexts(container)[0]).toContain('Second User');

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

  it('clicking the Last Active header cycles from its default descending order to unsorted, then ascending', () => {
    const { container } = setup();
    const header = headerFor(container, 'Last Active') as Element;

    // Starts descending by default (see 'Last Active defaults to sorted newest-first').
    expect(header.getAttribute('aria-sort')).toBe('descending');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe(null); // cycles back to unsorted

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    // Test User has no usage (treated as time 0), sorts first ascending.
    expect(rowTexts(container)[0]).toContain('Test User');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    // Second User has a real timestamp, sorts first descending.
    expect(rowTexts(container)[0]).toContain('Second User');
  });

  it('Last Active defaults to sorted newest-first', () => {
    const { container } = setup();
    const header = headerFor(container, 'Last Active') as Element;

    expect(header.getAttribute('aria-sort')).toBe('descending');
    // Second User has a real timestamp (2026-02-03); Test User has never logged in
    // (treated as the oldest possible time), so Second User sorts first by default.
    expect(rowTexts(container)[0]).toContain('Second User');
    expect(rowTexts(container)[1]).toContain('Test User');
  });

  it('filtering Last Active by "Never Logged In" narrows the table to users with no activity', async () => {
    const { container } = setup();

    const header = headerFor(container, 'Last Active') as Element;
    const filterTrigger = header.querySelector('.ant-table-filter-trigger');
    expect(filterTrigger).toBeInTheDocument();

    fireEvent.click(filterTrigger as Element);

    const neverOption = await screen.findByText('Never Logged In');
    const checkbox = neverOption.closest('label')?.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox as Element);

    const okButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.click(okButton);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.queryByText('Second User')).not.toBeInTheDocument();
  });

  it('filtering Last Active by an exact "on or before" date includes users active on that date and excludes later ones', async () => {
    const threeUsers: UserWithUsage[] = [
      { ...users[0] }, // Test User: never logged in
      {
        user_email: 'secondEmail@test.com',
        user_display_name: 'Second User',
        user_id: 2,
        projects: [],
        basicRoles: [{ user_email: 'secondEmail@test.com', role_id: 2 }],
        courses: [],
        api_usages: [{ timestamp: '2026-02-03T12:00:00.000Z' }], // well before the cutoff
      },
      {
        user_email: 'thirdEmail@test.com',
        user_display_name: 'Third User',
        user_id: 3,
        projects: [],
        basicRoles: [{ user_email: 'thirdEmail@test.com', role_id: 2 }],
        courses: [],
        api_usages: [{ timestamp: '2026-05-31T09:00:00.000Z' }], // exactly on the cutoff
      },
      {
        user_email: 'fourthEmail@test.com',
        user_display_name: 'Fourth User',
        user_id: 4,
        projects: [],
        basicRoles: [{ user_email: 'fourthEmail@test.com', role_id: 2 }],
        courses: [],
        api_usages: [{ timestamp: '2026-06-01T09:00:00.000Z' }], // after the cutoff
      },
    ];

    const { container } = render(
      <BrowserRouter>
        <Provider store={store}>
          <AdminUserTable users={threeUsers} roles={roles} />
        </Provider>
      </BrowserRouter>,
    );

    const header = headerFor(container, 'Last Active') as Element;
    fireEvent.click(header.querySelector('.ant-table-filter-trigger') as Element);

    const dateInput = (await screen.findByPlaceholderText('Select date')) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2026-05-31' } });

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    // On-or-before 31 May: Test User (never active), Second User (Feb) and Third User (31 May exactly) included.
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Second User')).toBeInTheDocument();
    expect(screen.getByText('Third User')).toBeInTheDocument();
    // After 31 May: excluded.
    expect(screen.queryByText('Fourth User')).not.toBeInTheDocument();

    // Remaining matches show newest-first: Third User (31 May), then Second User (Feb), then Test User (never active).
    expect(rowTexts(container)[0]).toContain('Third User');
    expect(rowTexts(container)[1]).toContain('Second User');
    expect(rowTexts(container)[2]).toContain('Test User');
  });

  it('clicking a Last Active quick-preset button filters by that many months of inactivity', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-22T00:00:00.000Z'));

    const threeUsers: UserWithUsage[] = [
      {
        user_email: 'recentEmail@test.com',
        user_display_name: 'Recent User',
        user_id: 1,
        projects: [],
        basicRoles: [{ user_email: 'recentEmail@test.com', role_id: 2 }],
        courses: [],
        api_usages: [{ timestamp: '2026-09-01T00:00:00.000Z' }], // ~3 weeks ago
      },
      {
        user_email: 'staleEmail@test.com',
        user_display_name: 'Stale User',
        user_id: 2,
        projects: [],
        basicRoles: [{ user_email: 'staleEmail@test.com', role_id: 2 }],
        courses: [],
        api_usages: [{ timestamp: '2026-01-01T00:00:00.000Z' }], // well over 3 months ago
      },
    ];

    const { container } = render(
      <BrowserRouter>
        <Provider store={store}>
          <AdminUserTable users={threeUsers} roles={roles} />
        </Provider>
      </BrowserRouter>,
    );

    const header = headerFor(container, 'Last Active') as Element;
    fireEvent.click(header.querySelector('.ant-table-filter-trigger') as Element);

    fireEvent.click(await screen.findByRole('button', { name: '3 Months Ago' }));
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.getByText('Stale User')).toBeInTheDocument();
    expect(screen.queryByText('Recent User')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('filtering Projects by a specific project narrows the table', async () => {
    const { container } = setup();

    const header = headerFor(container, 'Projects') as Element;
    fireEvent.click(header.querySelector('.ant-table-filter-trigger') as Element);

    const dropdown = await screen.findByRole('menu');
    // Second User's only project has no course, so it's labelled "Independent".
    const option = await within(dropdown).findByText('Sample Project — Independent');
    const checkbox = option.closest('li')?.querySelector('input[type="checkbox"]');
    fireEvent.click(checkbox as Element);

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.getByText('Second User')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('disambiguates same-named projects from different courses in the Projects filter', async () => {
    const projectA = {
      id: 10,
      pname: 'Group 1',
      pkey: null,
      description: null,
      course_id: 100,
      public: false,
      created_at: '2026-01-01T00:00:00.000Z',
      is_archive: false,
      course: {
        id: 100,
        code: 'CS2103T',
        startYear: 2026,
        startSem: 1,
        endYear: 2026,
        endSem: 1,
        cname: 'Software Engineering',
        description: null,
        public: false,
        created_at: '2026-01-01T00:00:00.000Z',
        shadow_course: false,
        is_archive: false,
      },
    };
    const projectB = {
      id: 11,
      pname: 'Group 1',
      pkey: null,
      description: null,
      course_id: 200,
      public: false,
      created_at: '2026-01-01T00:00:00.000Z',
      is_archive: false,
      course: {
        id: 200,
        code: 'CS3213',
        startYear: 2026,
        startSem: 1,
        endYear: 2026,
        endSem: 1,
        cname: 'Foundations of Software Engineering',
        description: null,
        public: false,
        created_at: '2026-01-01T00:00:00.000Z',
        shadow_course: false,
        is_archive: false,
      },
    };

    const twoUsers: UserWithUsage[] = [
      {
        user_email: 'groupAEmail@test.com',
        user_display_name: 'Group A Student',
        user_id: 1,
        projects: [{ project_id: projectA.id, project: projectA }],
        basicRoles: [{ user_email: 'groupAEmail@test.com', role_id: 2 }],
        courses: [],
      },
      {
        user_email: 'groupBEmail@test.com',
        user_display_name: 'Group B Student',
        user_id: 2,
        projects: [{ project_id: projectB.id, project: projectB }],
        basicRoles: [{ user_email: 'groupBEmail@test.com', role_id: 2 }],
        courses: [],
      },
    ];

    const { container } = render(
      <BrowserRouter>
        <Provider store={store}>
          <AdminUserTable users={twoUsers} roles={roles} />
        </Provider>
      </BrowserRouter>,
    );

    const header = headerFor(container, 'Projects') as Element;
    fireEvent.click(header.querySelector('.ant-table-filter-trigger') as Element);

    const dropdown = await screen.findByRole('menu');
    expect(within(dropdown).getByText('Group 1 — CS2103T')).toBeInTheDocument();
    expect(within(dropdown).getByText('Group 1 — CS3213')).toBeInTheDocument();

    const option = within(dropdown).getByText('Group 1 — CS2103T');
    const checkbox = option.closest('li')?.querySelector('input[type="checkbox"]');
    fireEvent.click(checkbox as Element);
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.getByText('Group A Student')).toBeInTheDocument();
    expect(screen.queryByText('Group B Student')).not.toBeInTheDocument();
  });

  it('combines a Role filter and a Last Active filter with AND, not OR', async () => {
    // This test opens two dropdowns and applies two filters sequentially, which
    // legitimately takes longer than the default 5s timeout under load.
    const fourUsers: UserWithUsage[] = [
      {
        // Matches both filters: Admin, inactive since before the cutoff.
        user_email: 'staleAdmin@test.com',
        user_display_name: 'Stale Admin',
        user_id: 1,
        projects: [],
        basicRoles: [{ user_email: 'staleAdmin@test.com', role_id: 3 }],
        courses: [],
        api_usages: [{ timestamp: '2026-01-01T00:00:00.000Z' }],
      },
      {
        // Right role, but too recently active: should be excluded.
        user_email: 'activeAdmin@test.com',
        user_display_name: 'Active Admin',
        user_id: 2,
        projects: [],
        basicRoles: [{ user_email: 'activeAdmin@test.com', role_id: 3 }],
        courses: [],
        api_usages: [{ timestamp: '2026-08-01T00:00:00.000Z' }],
      },
      {
        // Stale enough, but wrong role: should be excluded.
        user_email: 'staleStudent@test.com',
        user_display_name: 'Stale Student',
        user_id: 3,
        projects: [],
        basicRoles: [{ user_email: 'staleStudent@test.com', role_id: 2 }],
        courses: [],
        api_usages: [{ timestamp: '2026-01-01T00:00:00.000Z' }],
      },
    ];

    const { container } = render(
      <BrowserRouter>
        <Provider store={store}>
          <AdminUserTable users={fourUsers} roles={roles} />
        </Provider>
      </BrowserRouter>,
    );

    // Filter Role = Admin.
    const roleHeader = headerFor(container, 'Role') as Element;
    fireEvent.click(roleHeader.querySelector('.ant-table-filter-trigger') as Element);
    const roleDropdown = await screen.findByRole('menu');
    const adminOption = await within(roleDropdown).findByText('Admin');
    fireEvent.click(adminOption.closest('li')?.querySelector('input[type="checkbox"]') as Element);
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    // Filter Last Active on or before 1 March 2026.
    const lastActiveHeader = headerFor(container, 'Last Active') as Element;
    fireEvent.click(lastActiveHeader.querySelector('.ant-table-filter-trigger') as Element);
    const dateInput = await screen.findByPlaceholderText('Select date');
    fireEvent.change(dateInput, { target: { value: '2026-03-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.getByText('Stale Admin')).toBeInTheDocument();
    expect(screen.queryByText('Active Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Stale Student')).not.toBeInTheDocument();
  }, 15000);

  it('renders no filter chips when no filters are active', () => {
    setup();
    expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
  });

  it('shows a filter chip after applying a Role filter, labelled with the role name', async () => {
    const { container } = setup();

    const header = headerFor(container, 'Role') as Element;
    fireEvent.click(header.querySelector('.ant-table-filter-trigger') as Element);
    const dropdown = await screen.findByRole('menu');
    const adminOption = await within(dropdown).findByText('Admin');
    fireEvent.click(adminOption.closest('li')?.querySelector('input[type="checkbox"]') as Element);
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText('Role: Admin')).toBeInTheDocument();
  });

  it('shows a filter chip after applying a Last Active date filter, labelled with the formatted date', async () => {
    const { container } = setup();

    const header = headerFor(container, 'Last Active') as Element;
    fireEvent.click(header.querySelector('.ant-table-filter-trigger') as Element);
    const dateInput = await screen.findByPlaceholderText('Select date');
    fireEvent.change(dateInput, { target: { value: '2026-05-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.getByText('Last Active: on or before 31/05/2026')).toBeInTheDocument();
  });

  it('clicking a chip\'s × clears only that column\'s filter', async () => {
    const { container } = setup();

    // Apply a Role filter.
    const roleHeader = headerFor(container, 'Role') as Element;
    fireEvent.click(roleHeader.querySelector('.ant-table-filter-trigger') as Element);
    const roleDropdown = await screen.findByRole('menu');
    const adminOption = await within(roleDropdown).findByText('Admin');
    fireEvent.click(adminOption.closest('li')?.querySelector('input[type="checkbox"]') as Element);
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.queryByText('Second User')).not.toBeInTheDocument();
    expect(screen.getByText('Role: Admin')).toBeInTheDocument();

    // Clear it via the chip's ×.
    const chip = screen.getByText('Role: Admin').closest('.ant-tag') as HTMLElement;
    const closeIcon = chip.querySelector('.anticon-close') as Element;
    fireEvent.click(closeIcon);

    expect(screen.queryByText('Role: Admin')).not.toBeInTheDocument();
    expect(screen.getByText('Second User')).toBeInTheDocument();
  });

  it('clearing the Last Active filter via its chip also clears the date shown when the dropdown is reopened', async () => {
    const { container } = setup();
    const header = headerFor(container, 'Last Active') as Element;

    // Apply a date filter.
    fireEvent.click(header.querySelector('.ant-table-filter-trigger') as Element);
    const dateInput = await screen.findByPlaceholderText('Select date');
    fireEvent.change(dateInput, { target: { value: '2026-05-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(screen.getByText('Last Active: on or before 31/05/2026')).toBeInTheDocument();

    // Clear it via the chip's ×, without touching the dropdown.
    const chip = screen.getByText(/Last Active: on or before/).closest('.ant-tag') as HTMLElement;
    fireEvent.click(chip.querySelector('.anticon-close') as Element);
    expect(screen.queryByText(/Last Active: on or before/)).not.toBeInTheDocument();

    // Reopen the dropdown: the date picker must not still show the cleared date.
    fireEvent.click(header.querySelector('.ant-table-filter-trigger') as Element);
    const reopenedDateInput = (await screen.findByPlaceholderText('Select date')) as HTMLInputElement;
    expect(reopenedDateInput.value).toBe('');
  });
});
