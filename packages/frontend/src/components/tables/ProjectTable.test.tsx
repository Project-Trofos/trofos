import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';
import ProjectTable from './ProjectTable';
import store from '../../app/store';
import server from '../../mocks/server';
import { Project } from '../../api/types';

describe('test ProjectTable', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mockProjects: Project[] = [
    {
      id: 1,
      pname: 'project1',
      pkey: null,
      description: 'project1_description',
      course_id: 1,
      public: false,
      created_at: '2022-09-15T01:58:01.735Z',
    },
  ];

  const setup = () => {
    const { baseElement, debug } = render(
      <BrowserRouter>
        <Provider store={store}>
          <ProjectTable projects={mockProjects} isLoading={false} />
        </Provider>
      </BrowserRouter>,
    );
    return { baseElement, debug };
  };

  it('should render table with correct fields', () => {
    const { baseElement } = setup();

    expect(screen.getByText('Projects')).toBeInTheDocument();

    // Ensure columns are present
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
