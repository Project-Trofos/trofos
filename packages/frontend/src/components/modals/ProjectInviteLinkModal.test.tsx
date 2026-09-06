import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Invite } from '../../api/types';
import ProjectInviteLinkModal from './ProjectInviteLinkModal';

const mocks = vi.hoisted(() => ({
  createOrGetInviteLink: vi.fn(),
}));

vi.mock('../../api/invite', () => ({
  useCreateOrGetProjectInviteLinkMutation: () => [mocks.createOrGetInviteLink, { isLoading: false }],
}));

describe('ProjectInviteLinkModal', () => {
  const invite: Invite = {
    project_id: 12,
    unique_token: 'invite-token',
    expiry_date: '2026-09-11T00:00:00.000Z',
  };

  beforeEach(() => {
    mocks.createOrGetInviteLink.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(invite),
    });
  });

  it('loads and displays the reusable invite link when opened', async () => {
    render(<ProjectInviteLinkModal projectId={invite.project_id} />);

    fireEvent.click(screen.getByRole('button', { name: /invite/i }));

    const linkInput = await screen.findByRole('textbox', { name: 'Project invite link' });
    expect(mocks.createOrGetInviteLink).toHaveBeenCalledWith({ projectId: invite.project_id });
    expect(linkInput).toHaveValue(`${window.location.origin}/join?token=${invite.unique_token}`);
  });

  it('copies the displayed link to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    render(<ProjectInviteLinkModal projectId={invite.project_id} />);

    fireEvent.click(screen.getByRole('button', { name: /invite/i }));
    await screen.findByRole('textbox', { name: 'Project invite link' });
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/join?token=${invite.unique_token}`),
    );
  });
});
