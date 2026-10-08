import { render, screen } from '@testing-library/react';
import React from 'react';
import ProjectPeople from './ProjectPeople';

const state = vi.hoisted(() => ({
  featureEnabled: true,
  userId: 1,
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ projectId: '12' }),
}));
vi.mock('../../api/auth', () => ({
  useGetUserInfoQuery: () => ({
    data: { userId: state.userId, userRoleActions: [], userRoleId: 2 },
  }),
}));
vi.mock('../../api/role', () => ({
  useGetActionsOnRolesQuery: () => ({ data: [] }),
}));
vi.mock('../../api/hooks', () => ({
  useProject: () => ({
    project: { id: 12, owner_id: 1, users: [] },
    projectUserRoles: [],
    handleAddUser: vi.fn(),
    handleRemoveUser: vi.fn(),
    handleUpdateUserRole: vi.fn(),
    isLoading: false,
    course: undefined,
  }),
}));
vi.mock('../../api/hooks/roleHooks', () => ({
  useIsCourseManager: () => ({ isCourseManager: false }),
}));
vi.mock('../../api/user', () => ({
  useFindUserByEmailMutation: () => [vi.fn()],
}));
vi.mock('../../api/featureFlag', () => ({
  useGetFeatureFlagsQuery: () => ({
    data: [{ feature_name: 'project_invite_links', active: state.featureEnabled }],
  }),
}));
vi.mock('../../components/tables/UserTable', () => ({
  default: ({ control }: { control: React.ReactNode }) => <div>{control}</div>,
}));
vi.mock('../../components/modals/ProjectInviteLinkModal', () => ({
  default: () => <button>Project invite link</button>,
}));

describe('ProjectPeople invite-link controls', () => {
  beforeEach(() => {
    state.featureEnabled = true;
    state.userId = 1;
  });

  it('shows the invite-link control to the project owner when enabled', () => {
    render(<ProjectPeople />);
    expect(screen.getByRole('button', { name: 'Project invite link' })).toBeInTheDocument();
  });

  it('hides the invite-link control when the feature is disabled', () => {
    state.featureEnabled = false;
    render(<ProjectPeople />);
    expect(screen.queryByRole('button', { name: 'Project invite link' })).not.toBeInTheDocument();
  });

  it('shows the invite-link control to non-owner project users', () => {
    state.userId = 2;
    render(<ProjectPeople />);
    expect(screen.getByRole('button', { name: 'Project invite link' })).toBeInTheDocument();
  });
});
