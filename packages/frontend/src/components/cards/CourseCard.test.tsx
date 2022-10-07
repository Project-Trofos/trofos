import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import CourseCard from './CourseCard';
import store from '../../app/store';

describe('CourseCard test', () => {
  const course = {
    id: 'CS3203',
    cname: 'Software Engineering Project',
    description: 'description',
    year: 2022,
    sem: 1,
    public: true,
    created_at: '2022-09-14T03:33:34.960Z',
  };
  const { baseElement } = render(
    <Provider store={store}>
      <BrowserRouter>
        <CourseCard course={course} />
      </BrowserRouter>
    </Provider>,
  );

  it('renders course card with correct details', () => {
    expect(screen.getByText(course.id)).toBeInTheDocument();
    expect(screen.getByText(course.cname)).toBeInTheDocument();
    expect(screen.getByText(course.sem, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(course.year, { exact: false })).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
