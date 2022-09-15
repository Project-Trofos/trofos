import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import CourseCreationModal from './CourseCreationModal';
import store from '../../app/store';
import server from '../../mocks/server';

describe('test project creation modal', () => {

  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.

  afterEach(() => server.resetHandlers());

  // Clean up after the tests are finished.
  afterAll(() => server.close());
  
  const setup = () => {
    const { baseElement, debug } = render(<Provider store={store}><CourseCreationModal /></Provider>);
    return { baseElement, debug };
  };

  it('should render modal with correct fields', () => {
    const { baseElement } = setup();

    // Open modal
    const button = screen.getByText(/create course/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Code')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });


  it('should be required course name', async () => {
    setup();

    const button = screen.getByText(/create course/i);
    fireEvent.click(button);

    const finishButton = await screen.findByText(/finish/i);
    fireEvent.click(finishButton);

    await screen.findByText('Please input your course\'s name!');
  });


  it('should submit correctly if fields are typed in', async () => {
    setup();
    const button = screen.getByText(/create course/i);
    fireEvent.click(button);
    const finishButton = await screen.findByText(/finish/i);

    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'name' } });

    fireEvent.click(finishButton);

    // Modal is closed
    await waitFor(() => expect(screen.queryByText('Please input the details for your course.')).toBeNull());
  });

});