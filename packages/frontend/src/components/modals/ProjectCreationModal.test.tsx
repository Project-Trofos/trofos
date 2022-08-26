import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import ProjectCreationModal from './ProjectCreationModal';
import store from '../../app/store';


test('renders create project modal with correct fields', () => {
  const { baseElement } = render(<Provider store={store}><ProjectCreationModal /></Provider>);

  // Open modal
  const button = screen.getByText(/create project/i);
  fireEvent.click(button);

  // Ensure fields are present
  expect(screen.getByLabelText('Name')).toBeInTheDocument();
  expect(screen.getByLabelText('Key')).toBeInTheDocument();

  // Compare with snapshot to ensure structure remains the same
  expect(baseElement).toMatchSnapshot();
});

