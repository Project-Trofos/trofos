import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import ProjectCreationModal from './ProjectCreationModal';
import store from '../../app/store';


describe('test project creation modal', () => {

  const setup = () => {
    const { baseElement, debug } = render(<Provider store={store}><ProjectCreationModal /></Provider>);
    return { baseElement, debug };
  };

  const goToSecondStep = async () => {
    setup();
    const button = screen.getByText('Create Project');
    fireEvent.click(button);

    const nextButton = await screen.findByText('Next');
    const pnameInput = screen.getByLabelText('Name');

    fireEvent.change(pnameInput, { target: { value: 'pname' } });
    fireEvent.click(nextButton);

    await screen.findByText('You can attach this project to a course.');
  };

  test('renders modal with correct fields', () => {
    const { baseElement } = setup();

    // Open modal
    const button = screen.getByText(/create project/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Key')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });


  test('project name should be required', async () => {
    setup();

    const button = screen.getByText('Create Project');
    fireEvent.click(button);

    const nextButton = await screen.findByText('Next');
    fireEvent.click(nextButton);

    await screen.findByText('Please input your project\'s name!');
  });

  test('able to go to second step', async () => {
    await goToSecondStep();
  });

  test('course code is required if course name is not empty', async () => {
    await goToSecondStep();
    const input = screen.getByLabelText('Course Name');
    fireEvent.change(input, { target: { value: 'cname' } });

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);

    await screen.findByText('Please input your course\'s code!');
  });

  test('course code is not required if course name is not empty', async () => {
    await goToSecondStep();
    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);
    
    // Modal is closed
    await waitFor(() => expect(screen.queryByText('You can attach this project to a course.')).toBeNull());
  });

  test('modal should be submitted correctly if fields are typed in', async () => {
    await goToSecondStep();

    const input = screen.getByLabelText('Course Code');
    fireEvent.change(input, { target: { value: 'code' } });

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);
    
    // Modal is closed
    await waitFor(() => expect(screen.queryByText('You can attach this project to a course.')).toBeNull());
  });

});