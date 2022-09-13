import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import CourseCreationModal from './CourseCreationModal';
import store from '../../app/store';


describe('test project creation modal', () => {

  const setup = () => {
    const { baseElement, debug } = render(<Provider store={store}><CourseCreationModal /></Provider>);
    return { baseElement, debug };
  };


  test('renders modal with correct fields', () => {
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


  test('course name should be required', async () => {
    setup();

    const button = screen.getByText(/create course/i);
    fireEvent.click(button);

    const finishButton = await screen.findByText(/finish/i);
    fireEvent.click(finishButton);

    await screen.findByText('Please input your course\'s name!');
  });


  test('modal should be submitted correctly if fields are typed in', async () => {
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