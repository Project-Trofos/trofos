import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from '../../app/store';
import ProjectCard from './ProjectCard';
import { Project, Course } from '../../api/types';

describe('ProjectCard test', () => {
  it('renders independent project card with correct details', () => {
    const independentProject: Project = {
      id: 1,
      pname: 'project-name',
      description: 'description',
      pkey: 'project-key',
      course_id: null,
      public: true,
      created_at: '2022-09-14T03:33:34.960Z',
      is_archive: null,
    };
    const { baseElement } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ProjectCard project={independentProject} />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText(independentProject.pname)).toBeInTheDocument();
    expect(screen.getByText(independentProject.description!)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('renders project card with correct details', () => {
    const project: Project = {
      id: 1,
      pname: 'project-name',
      description: 'description',
      pkey: 'project-key',
      course_id: 1,
      course: {
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
        shadow_course: false,
        is_archive: null,
      },
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

    expect(screen.getByText(project.pname)).toBeInTheDocument();
    expect(screen.getByText(project.description!)).toBeInTheDocument();
    expect(screen.getByText(project.course!.cname)).toBeInTheDocument();
    expect(screen.getByText(project.course!.startYear, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(project.course!.startSem, { exact: false })).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
