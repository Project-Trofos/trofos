import React from 'react';
import { render, screen } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import CourseTable from './CourseTable';
import { Course } from '../../api/types';

describe('test CourseTable', () => {
  const mockCourses: Course[] = [
    {
      id: 1,
      code: 'course_id',
      startYear: 2022,
      startSem: 102,
      endYear: 2023,
      endSem: 103,
      cname: 'course1',
      description: 'project1_description',
      public: false,
      created_at: '2022-09-15T01:58:01.735Z',
      shadow_course: false,
      is_archive: null,
    },
  ];

  const setup = () => {
    const { baseElement, debug } = render(
      <BrowserRouter>
        <CourseTable courses={mockCourses} isLoading={false} />
      </BrowserRouter>,
    );
    return { baseElement, debug };
  };

  it('should render table with correct fields', () => {
    const { baseElement } = setup();

    expect(screen.getByText('Courses')).toBeInTheDocument();

    // Ensure columns are present
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();

    // Ensure row is present
    expect(screen.getByText(mockCourses[0].code)).toBeInTheDocument();
    expect(screen.getByText(mockCourses[0].startYear)).toBeInTheDocument();
    expect(screen.getByText(mockCourses[0].startSem)).toBeInTheDocument();
    expect(screen.getByText(mockCourses[0].endYear)).toBeInTheDocument();
    expect(screen.getByText(mockCourses[0].endSem)).toBeInTheDocument();
    expect(screen.getByText(mockCourses[0].cname)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
