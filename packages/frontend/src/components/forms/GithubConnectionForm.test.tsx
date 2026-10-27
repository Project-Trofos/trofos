import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import GithubConnectionForm from './GithubConnectionForm';

vi.mock('react-router-dom', () => ({ useParams: () => ({ projectId: '3' }) }));
const fetchMock = vi.fn();
beforeEach(() => { vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const response = (data: unknown, ok = true) => ({ ok, json: async () => data });
it('shows configuration errors without claiming a connection exists', async () => {
  fetchMock.mockResolvedValue(response({ error: 'GitHub connection is not configured.' }, false));
  render(<GithubConnectionForm />);
  expect(await screen.findByText('GitHub connection is not configured.')).toBeInTheDocument();
});
it('shows the connected repository and asks before disconnecting', async () => {
  fetchMock.mockResolvedValueOnce(response({ connection: { repo: 'https://github.com/team/repo.git', installation_id: '2', active: true }, authorised: false, installUrl: 'https://github.com/apps/test/installations/new' }));
  render(<GithubConnectionForm />);
  expect(await screen.findByText(/Connected: https/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }));
  expect(await screen.findByText('Disconnect this repository for the project?')).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('loads the repository picker after authorisation and disables save until selection', async () => {
  fetchMock.mockResolvedValueOnce(response({ connection: null, authorised: true, installUrl: 'https://github.com/apps/test/installations/new' }));
  fetchMock.mockResolvedValueOnce(response([{ id: 4, installationId: 2, full_name: 'team/repo' }]));
  render(<GithubConnectionForm />);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(screen.getByRole('button', { name: 'Save repository' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: 'GitHub repository' })).toBeInTheDocument();
});
