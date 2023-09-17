import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import SprintCreationModal from './SprintCreationModal';
import store from '../../app/store';

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
