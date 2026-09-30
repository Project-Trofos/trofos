import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import '../../mocks/antd';
import SprintCreationModal from './SprintCreationModal';
import store from '../../app/store';
import type { Sprint } from '../../api/sprint';

const mocks = vi.hoisted(() => ({
  featureFlags: undefined as { feature_name: string; active: boolean }[] | undefined,
  autofillSprint: vi.fn(),
}));

vi.mock('../../api/featureFlag', () => ({
  useGetFeatureFlagsQuery: () => ({ data: mocks.featureFlags }),
}));

vi.mock('../../api/ai', () => ({
  useAutofillSprintMutation: () => [mocks.autofillSprint, { isLoading: false }],
}));

describe('SprintModal tests', () => {
  it('renders new sprint modal with correct fields', () => {
    const mockSprintCreationModalProps = {
      isModalVisible: true,
      setIsModalVisible: vi.fn(),
      setSprint: vi.fn(),
      latestSprint: {
        name: 'Sprint 1',
        dates: undefined,
        duration: 1,
      },
    };

    const { baseElement } = render(
      <Provider store={store}>
        <SprintCreationModal
          isModalVisible={mockSprintCreationModalProps.isModalVisible}
          setIsModalVisible={mockSprintCreationModalProps.setIsModalVisible}
          setSprint={mockSprintCreationModalProps.setSprint}
          latestSprint={mockSprintCreationModalProps.latestSprint}
        />
      </Provider>,
    );

    // Ensure fields are present
    expect(screen.getByLabelText('Sprint Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Duration')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Sprint Goals')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});

describe('SprintModal AI assist', () => {
  const latestSprint = {
    name: 'Sprint 1',
    dates: undefined,
    duration: 1,
  };

  const existingSprint: Sprint = {
    id: 1,
    name: 'Sprint 1',
    duration: 1,
    goals: null,
    start_date: '2025-01-06T00:00:00.000Z',
    end_date: '2025-01-13T00:00:00.000Z',
    project_id: 1,
    status: 'upcoming',
    backlogs: [],
  };

  const renderModal = (sprint?: Sprint) =>
    render(
      <Provider store={store}>
        <SprintCreationModal
          isModalVisible
          setIsModalVisible={vi.fn()}
          sprint={sprint}
          setSprint={vi.fn()}
          latestSprint={latestSprint}
        />
      </Provider>,
    );

  beforeEach(() => {
    mocks.featureFlags = [{ feature_name: 'ai_autofill', active: true }];
    mocks.autofillSprint.mockReset();
  });

  afterAll(() => {
    mocks.featureFlags = undefined;
  });

  it('should not show AI assist when the feature flag is off', () => {
    mocks.featureFlags = [{ feature_name: 'ai_autofill', active: false }];
    renderModal();

    expect(screen.queryByLabelText('AI assist')).not.toBeInTheDocument();
  });

  it('should not show AI assist in edit mode even when the flag is on', () => {
    renderModal(existingSprint);

    expect(screen.queryByLabelText('AI assist')).not.toBeInTheDocument();
  });

  it('should fill name, duration, start date and goals returned by the AI', async () => {
    mocks.autofillSprint.mockReturnValue({
      unwrap: () =>
        Promise.resolve({ name: 'Sprint 3', duration: 2, startDate: '2025-01-06', goals: 'Ship it' }),
    });
    renderModal();

    fireEvent.click(screen.getByLabelText('AI assist'));
    fireEvent.change(screen.getByLabelText('AI assist input'), {
      target: { value: 'Sprint 3, 2 weeks starting 6 Jan 2025, goal: ship it' },
    });
    fireEvent.click(screen.getByText('Fill with AI'));

    await waitFor(() => expect(screen.getByLabelText('Sprint Name')).toHaveValue('Sprint 3'));
    expect(screen.getByLabelText('Sprint Goals')).toHaveValue('Ship it');
  });

  it('should not set start date when duration is missing', async () => {
    mocks.autofillSprint.mockReturnValue({
      unwrap: () => Promise.resolve({ startDate: '2025-01-06' }),
    });
    renderModal();

    fireEvent.click(screen.getByLabelText('AI assist'));
    fireEvent.change(screen.getByLabelText('AI assist input'), { target: { value: 'starting 6 Jan 2025' } });
    fireEvent.click(screen.getByText('Fill with AI'));

    await waitFor(() => expect(mocks.autofillSprint).toHaveBeenCalled());
    await screen.findByText('Could not find any sprint details in the text.');
  });
});
