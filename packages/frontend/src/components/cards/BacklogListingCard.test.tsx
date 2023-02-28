import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import BacklogListingCard from './BacklogListingCard';
import type { Backlog } from '../../api/types';
import store from '../../app/store';

describe('BacklogCard test', () => {
  const mockBacklog: Backlog = {
    backlog_id: 111,
    summary: 'A Test Summary',
    type: 'story',
    priority: 'very_high',
    sprint_id: 123,
    reporter_id: 1,
    assignee_id: 2,
    points: 3,
    description: 'A test description here',
    project_id: 123,
    status: 'todo',
    assignee: {
      created_at: '2022-12-26T04:19:07.531Z',
      project_id: 903,
      user_id: 2,
      user: {
        user_email: 'testBacklogUser2@test.com',
        user_display_name: 'Backlog User 2',
      },
    },
  };
  const { baseElement } = render(
    <Provider store={store}>
      <BacklogListingCard backlog={mockBacklog} projectKey="MOCK" />
    </Provider>,
  );

  it('renders backlog card with correct details', () => {
    expect(screen.getByText('MOCK-111')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A Test Summary')).toBeInTheDocument();
    expect(screen.getByText('Story')).toBeInTheDocument();
    expect(screen.getByText('Very High')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue(3)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
