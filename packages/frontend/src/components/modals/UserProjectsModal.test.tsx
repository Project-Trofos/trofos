import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserProjectsModal from './UserProjectsModal';
import { User } from '../../api/types';

describe('test UserProjectsModal', () => {
  const userWithProject: User = {
    user_email: 'test@test.com',
    user_display_name: 'Test User',
    user_id: 1,
    projects: [{ project_id: 1, project: { id: 1, pname: 'Sample Project', pkey: null, description: null, course_id: null, public: false, created_at: '2026-01-01T00:00:00.000Z', is_archive: false } }],
    courses: [],
    basicRoles: [],
  };

  it('renders the default eye-icon button when no trigger is provided', () => {
    render(<UserProjectsModal user={userWithProject} />);
    expect(screen.getByTitle('View Assigned Projects')).toBeInTheDocument();
  });

  it('renders a given custom trigger instead of the default button', () => {
    render(<UserProjectsModal user={userWithProject} trigger={<span>2 Projects</span>} />);
    expect(screen.getByText('2 Projects')).toBeInTheDocument();
    expect(screen.queryByTitle('View Assigned Projects')).not.toBeInTheDocument();
  });

  it('clicking a custom trigger opens the modal showing the user\'s projects', () => {
    render(<UserProjectsModal user={userWithProject} trigger={<span>2 Projects</span>} />);
    fireEvent.click(screen.getByText('2 Projects'));
    expect(screen.getByText('Sample Project')).toBeInTheDocument();
  });
});
