import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import EpicCreationModal from './EpicCreationModal';
import store from '../../app/store';

describe('EpicModal tests', () => {
  it('renders new epic modal with correct fields', () => {
    const { baseElement } = render(
      <Provider store={store}>
        <EpicCreationModal />
      </Provider>,
    );

    // Open modal
    const button = screen.getByText(/New Epic/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByPlaceholderText('An awesome epic name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe the goals of this epic...')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
