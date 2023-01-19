import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import CourseCard from './CourseCard';
import store from '../../app/store';
import { Course } from '../../api/types';

describe('CourseCard test', () => {
  const course: Course = {
    id: 1,
    code: 'CS3203',
    cname: 'Software Engineering Project',
    description: 'description',
    startYear: 2022,
    startSem: 1,
    endYear: 2022,
    endSem: 1,
    public: true,
    created_at: '2022-09-14T03:33:34.960Z',
    shadow_course : false,
  };
  const { baseElement } = render(
    <Provider store={store}>
      <BrowserRouter>
        <CourseCard course={course} />
      </BrowserRouter>
    </Provider>,
  );

  it('renders course card with correct details', () => {
    expect(screen.getByText(course.code)).toBeInTheDocument();
    expect(screen.getByText(course.cname)).toBeInTheDocument();
    expect(screen.getByText(course.startSem, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(course.startYear, { exact: false })).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
