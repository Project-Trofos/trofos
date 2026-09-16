import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import InvitePage from './Invite';

const mocks = vi.hoisted(() => ({
  getInfoFromInvite: vi.fn(),
  processInvite: vi.fn(),
}));

vi.mock('../api/invite', () => ({
  useLazyGetInfoFromInviteQuery: () => [mocks.getInfoFromInvite],
  useProcessProjectInvitationMutation: () => [mocks.processInvite, { isLoading: false }],
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
        inviterName: 'Alex Tan',
        projectName: 'Test project',
        courseName: 'Software Engineering',
        expiresAt: '2026-09-11T00:00:00.000Z',
      }),
    });
  });

  it('shows the invitation details and joins only after confirmation', async () => {
    mocks.processInvite.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ projectId: 12 }),
    });

    renderInvitePage();

    expect(await screen.findByText(/Alex Tan/)).toBeInTheDocument();
    expect(screen.getByText('Name:').parentElement).toHaveTextContent('Name: Test project');
    expect(screen.getByText('Course:').parentElement).toHaveTextContent('Course: Software Engineering');
    expect(mocks.processInvite).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Join project' }));
    await screen.findByText('Project page');
    expect(mocks.getInfoFromInvite).toHaveBeenCalledWith('invite-token');
    expect(mocks.processInvite).toHaveBeenCalledWith('invite-token');
  });

  it('redirects an unauthenticated invitee to login', async () => {
    mocks.processInvite.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({ status: 401 }),
    });

    renderInvitePage();

    fireEvent.click(await screen.findByRole('button', { name: 'Join project' }));
    await waitFor(() => expect(screen.getByText('Login page')).toBeInTheDocument());
  });

  it('does not show a course when the project has no course', async () => {
    mocks.getInfoFromInvite.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        projectId: 12,
        inviterName: 'Alex Tan',
        projectName: 'Independent project',
        expiresAt: '2026-09-11T00:00:00.000Z',
      }),
    });

    renderInvitePage();

    await screen.findByText(/Alex Tan/);
    expect(screen.queryByText(/Course:/)).not.toBeInTheDocument();
  });
});
