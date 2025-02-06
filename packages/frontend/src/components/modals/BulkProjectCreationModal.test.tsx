import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import '../../mocks/antd';

import store from '../../app/store';
import BulkProjectCreationModal from './BulkProjectCreationModal';
import { CourseData, ProjectData } from '../../api/types';
import { UserInfo } from '../../api/auth';
import server from '../../mocks/server';

describe('test course creation modal', () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.

  afterEach(() => server.resetHandlers());

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  const mockCourseData: CourseData = {
    id: 1,
    code: 'course_id',
    startYear: 2022,
    startSem: 10,
    endYear: 2022,
    endSem: 10,
    cname: 'course1',
    description: 'project1_description',
    public: false,
    created_at: '2022-09-15T01:58:01.735Z',
    milestones: [],
    announcements: [],
    shadow_course: false,
    is_archive: null,
    users: [
      {
        user: {
          user_id: 1,
          user_email: 'email',
          user_display_name: 'User 1',
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
    ],
  };

  const mockProjectData: ProjectData[] = [];

  const mockUserInfo: UserInfo = {
    userEmail: 'email',
    userDisplayName: 'User 1',
    userId: 1,
    userRoleActions: [],
    userRoleId: 1,
    hasCompletedTour: false,
  };

  const setup = (course: CourseData, projects: ProjectData[]) => {
    const { baseElement, debug } = render(
      <Provider store={store}>
        <BulkProjectCreationModal course={course} projects={projects} />
      </Provider>,
    );

    // Open modal
    const button = screen.getByText(/bulk create/i);
    fireEvent.click(button);

    return { baseElement, debug };
  };

  it('should render fields if there are users without project', async () => {
    // Use a different ID
    const { baseElement } = setup(mockCourseData, mockProjectData);

    // Ensure fields are present
    await screen.findByText(/Number of students in a project:/i);
    await screen.findByText(/You have selected \d+ user\(s\)./i, { exact: false });

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should not render fields if there no user without a project', () => {
    setup(
      {
        ...mockCourseData,
        users: [],
      },
      mockProjectData,
    );

    expect(screen.queryByText(/Number of students in a project:/i)).toBeNull();
    expect(screen.queryByText(/You have selected \d+ user\(s\)./i, { exact: false })).toBeNull();
  });

  it('should be able to generate groups', async () => {
    // Use a different ID
    setup(mockCourseData, mockProjectData);

    const checkboxes = await screen.findAllByRole('checkbox');

    // Click select all checkbox
    fireEvent.click(checkboxes[0]);

    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: 1 } });

    const button = screen.getByText('Generate');

    fireEvent.click(button);

    // Group listed correctly
    await screen.findByText(/Group 1/i);
    expect(
      within(screen.getByTestId('bulk-project-creation-list')).getByText(mockUserInfo.userDisplayName),
    ).toBeInTheDocument();
  });
});
