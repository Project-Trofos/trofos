import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import user from '@testing-library/user-event';
import server from '../../mocks/server';
import ImportDataModal from './ImportDataModal';
import store from '../../app/store';
import { CourseData, ProjectData } from '../../api/types';

const mockFile = new File(['hello'], 'hello.png', { type: 'image/png' });

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
  users: [
    {
      user: {
        user_display_name: 'user',
        user_id: 1,
        user_email: 'email',
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

const mockProjectData: ProjectData = {
  id: 1,
  pname: 'c1',
  created_at: new Date().toISOString(),
  course_id: 5,
  course: mockCourseData,
  pkey: null,
  description: 'd1',
  public: false,
  users: [],
  sprints: [],
  backlogStatuses: [],
};

describe('test import data modal', () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.

  afterEach(() => server.resetHandlers());

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  const setup = (course: CourseData | undefined, projects: ProjectData[] | undefined) => {
    const { baseElement, debug } = render(
      <Provider store={store}>
        <ImportDataModal course={course} projects={projects} />
      </Provider>,
    );

    // Open modal
    const button = screen.getByText(/import csv data/i);
    fireEvent.click(button);

    return { baseElement, debug };
  };

  it('should display the components correctly', () => {
    const { baseElement } = setup(mockCourseData, [mockProjectData]);

    // Ensure components are present
    expect(screen.getByText(/select file/i)).toBeInTheDocument();
    expect(screen.getByText(/download csv template/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/^import$/i)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should disable the import button when no files are selected', () => {
    setup(mockCourseData, [mockProjectData]);

    const button = screen.getByRole('button', { name: /^import$/i });
    expect(button).toBeDisabled();
  });

  it('should enable the import button when a file is selected to be uploaded', async () => {
    setup(mockCourseData, [mockProjectData]);
    const input = screen.getByTestId('upload-button') as HTMLInputElement;
    /* eslint-disable testing-library/no-unnecessary-act */
    await act(async () => {
      fireEvent.change(input, {target: {files: [mockFile]}});
    })
    /* eslint-enable */

    expect(input.files![0]).toStrictEqual(mockFile);
    expect(input.files).toHaveLength(1);

    const button = screen.getByRole('button', { name: /^import$/i });
    expect(button).toBeEnabled();
  });

  it('should prevent the user from uploading a csv if the course has projects', async () => {

    setup(mockCourseData, [mockProjectData]);
    const input = screen.getByTestId('upload-button') as HTMLInputElement;
    /* eslint-disable testing-library/no-unnecessary-act */
    await act(async () => {
      fireEvent.change(input, {target: {files: [mockFile]}});
    })
    /* eslint-enable */

    expect(input.files![0]).toStrictEqual(mockFile);
    expect(input.files).toHaveLength(1);

    const button = screen.getByText(/^import$/i);
    fireEvent.click(button);
    expect(
      await screen.findByText(/course already has projects. please delete them before uploading a new csv file./i),
    ).toBeInTheDocument();
  });
});
