import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import BacklogCreationModal from './BacklogCreationModal';
import store from '../../app/store';

describe('BacklogModal tests', () => {
  it('renders new backlog modal with correct fields', () => {
    const { baseElement } = render(
      <Provider store={store}>
        <BacklogCreationModal />
      </Provider>,
    );

    // Open modal
    const button = screen.getByText(/New Backlog/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByPlaceholderText('* Type summary here...')).toBeInTheDocument();
    expect(screen.getByText('Type of backlog')).toBeInTheDocument();
    expect(screen.getByText('Select Sprint')).toBeInTheDocument();
    expect(screen.getByText('Select Priority')).toBeInTheDocument();
    expect(screen.getByText('Select User')).toBeInTheDocument();
    expect(screen.getByText('Assign to')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description...')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
