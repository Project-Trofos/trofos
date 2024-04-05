import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from '../../app/store';
import ProjectCard from './ProjectCard';

describe('CourseCard test', () => {
  const project = {
    id: 1,
    pname: 'project-name',
    description: 'description',
    pkey: 'project-key',
    course_id: null,
    course_sem: null,
    course_year: null,
    public: true,
    created_at: '2022-09-14T03:33:34.960Z',
    is_archive: null,
  };
  const { baseElement } = render(
    <Provider store={store}>
      <BrowserRouter>
        <ProjectCard project={project} />
      </BrowserRouter>
    </Provider>,
  );

  it('renders course card with correct details', () => {
    expect(screen.getByText(project.pname)).toBeInTheDocument();
    expect(screen.getByText(project.description)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
