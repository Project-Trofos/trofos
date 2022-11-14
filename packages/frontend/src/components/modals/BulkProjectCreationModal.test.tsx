import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '../../mocks/antd';

import store from '../../app/store';
import BulkProjectCreationModal from './BulkProjectCreationModal';
import { CourseData, ProjectData } from '../../api/types';
import { UserInfo } from '../../api/auth';

describe('test course creation modal', () => {
  const mockCourseData: CourseData = {
    id: 'course_id',
    year: 2022,
    sem: 10,
    cname: 'course1',
    description: 'project1_description',
    public: false,
    created_at: '2022-09-15T01:58:01.735Z',
    users: [{ user: { user_id: 1, user_email: 'email' } }],
  };

  const mockProjectData: ProjectData[] = [];

  const mockUserInfo: UserInfo = {
    userEmail: 'email',
    userId: 1,
    userRoleActions: [],
  };

  const setup = (course: CourseData | undefined, currentUserInfo: UserInfo | undefined, projects: ProjectData[]) => {
    const { baseElement, debug } = render(
      <Provider store={store}>
        <BulkProjectCreationModal course={course} currentUserInfo={currentUserInfo} projects={projects} />
      </Provider>,
    );

    // Open modal
    const button = screen.getByText(/bulk create/i);
    fireEvent.click(button);

    return { baseElement, debug };
  };

  it('should render fields if there are users without project', () => {
    // Use a different ID
    const { baseElement } = setup(mockCourseData, { ...mockUserInfo, userId: 2 }, mockProjectData);

    // Ensure fields are present
    expect(screen.getByText(/Number of students in a project:/i)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should not render fields if there no user without a project', () => {
    setup(mockCourseData, mockUserInfo, mockProjectData);

    expect(screen.queryByText(/Number of students in a project:/i)).toBeNull();
  });

  it('should be able to generate groups', async () => {
    // Use a different ID
    setup(mockCourseData, { ...mockUserInfo, userId: 2 }, mockProjectData);

    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: 1 } });

    const button = screen.getByText('Generate');

    fireEvent.click(button);

    await screen.findByText(/Group 1/i);
    expect(screen.getByText(mockUserInfo.userEmail)).toBeInTheDocument();
  });
});