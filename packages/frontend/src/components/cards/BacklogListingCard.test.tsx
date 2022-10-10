import React from 'react';
import { render, screen } from '@testing-library/react';
import BacklogListingCard from './BacklogListingCard';
import type { Backlog } from '../../api/backlog';

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
  };
  const { baseElement } = render(<BacklogListingCard backlog={mockBacklog} projectKey="MOCK" />);

  it('renders backlog card with correct details', () => {
    expect(screen.getByText('MOCK-111')).toBeInTheDocument();
    expect(screen.getByText('A Test Summary')).toBeInTheDocument();
    expect(screen.getByText('story')).toBeInTheDocument();
    expect(screen.getByText('very_high')).toBeInTheDocument();
    expect(screen.getByText('User2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});