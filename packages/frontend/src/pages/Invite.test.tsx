import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import InvitePage from './Invite';

const mocks = vi.hoisted(() => ({
  getInfoFromInvite: vi.fn(),
  processInvite: vi.fn(),
}));

vi.mock('../api/invite', () => ({
  useLazyGetInfoFromInviteQuery: () => [mocks.getInfoFromInvite],
  useProcessProjectInvitationMutation: () => [mocks.processInvite],
}));

function renderInvitePage() {
  return render(
    <MemoryRouter initialEntries={['/join?token=invite-token']}>
      <Routes>
        <Route path="/join" element={<InvitePage />} />
        <Route path="/project/:projectId" element={<p>Project page</p>} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('InvitePage', () => {
  beforeEach(() => {
    mocks.getInfoFromInvite.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        projectId: 12,
        projectName: 'Test project',
        expiresAt: '2026-09-11T00:00:00.000Z',
      }),
    });
  });

  it('joins the project and navigates to it', async () => {
    mocks.processInvite.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ projectId: 12 }),
    });

    renderInvitePage();

    await screen.findByText('Project page');
    expect(mocks.getInfoFromInvite).toHaveBeenCalledWith('invite-token');
    expect(mocks.processInvite).toHaveBeenCalledWith('invite-token');
  });

  it('redirects an unauthenticated invitee to login', async () => {
    mocks.processInvite.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({ status: 401 }),
    });

    renderInvitePage();

    await waitFor(() => expect(screen.getByText('Login page')).toBeInTheDocument());
  });
});
