import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import SprintListingCard from './SprintListingCard';
import store from '../../app/store';
import type { Sprint } from '../../api/sprint';

describe('SprintCard test', () => {
  const mockSprint: Sprint = {
    id: 111,
    name: 'Sprint 111',
    duration: 1,
    start_date: '2022-10-09 07:03:56',
    end_date: '2022-10-16 07:03:56',
    project_id: 123,
    goals: 'Some test goals',
		backlogs: [],
  };

  const mockSprintListingCardProps = {
    setSprint: jest.fn(),
    setIsModalVisible: jest.fn(),
  };

  const { baseElement } = render(
		<Provider store={store}>
			<SprintListingCard
				sprint={mockSprint}
				setIsModalVisible={mockSprintListingCardProps.setIsModalVisible}
				setSprint={mockSprintListingCardProps.setSprint}
			/>
		</Provider>,
  );

  it('renders sprint card with correct details', () => {
    expect(screen.getByText('Sprint 111')).toBeInTheDocument();
    expect(screen.getByText('09/10/2022 - 16/10/2022')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
