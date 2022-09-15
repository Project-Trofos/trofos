import React from 'react';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { Provider } from 'react-redux';

import ProjectCreationModal from './ProjectCreationModal';
import store from '../../app/store';
import server from '../../mocks/server';

describe('test ProjectCreationModal', () => {

  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.

  afterEach(() => server.resetHandlers());

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  const setup = async () => {
    const { baseElement, debug } = render(<Provider store={store}><ProjectCreationModal /></Provider>);

    return { baseElement, debug };
  };

  const goToSecondStep = async () => {
    await setup();
    const button = screen.getByText('Create Project');
    fireEvent.click(button);

    const nextButton = await screen.findByText('Next');
    const pnameInput = screen.getByLabelText('Name');

    fireEvent.change(pnameInput, { target: { value: 'pname' } });
    fireEvent.click(nextButton);

    await screen.findByText('You can attach this project to a course.');
  };

  it('should render modal with correct fields', async () => {
    const { baseElement } = await setup();

    // Open modal
    const button = screen.getByText(/create project/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Key')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });


  it('should be require project name', async () => {
    await setup();

    const button = screen.getByText('Create Project');
    fireEvent.click(button);

    const nextButton = await screen.findByText('Next');
    fireEvent.click(nextButton);

    await screen.findByText('Please input your project\'s name!');
  });

  it('should be able to go to second step', async () => {
    await goToSecondStep();
  });

  it('should allow skipping course step by selecting independent project', async () => {
    await goToSecondStep();
    const segment = screen.getByText('Independent');
    fireEvent.click(segment);

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);

    await waitForElementToBeRemoved(() => screen.queryByText(/Finish/i));
  });

  // Can't get this test to work
  it.skip('should allow choosing a course from existing courses', async () => {
    await goToSecondStep();
    const segment = screen.getByText(/existing/i);
    fireEvent.click(segment);

    const select = screen.getByLabelText('Course');

    // ? I can't change the course
    fireEvent.change(select, { value: 'CS3203' });

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);

    await waitForElementToBeRemoved(() => screen.queryByText(/Finish/i));
  });

  it('should submit correctly if fields are typed in', async () => {
    await goToSecondStep();

    const segment = screen.getByText(/create new/i);
    fireEvent.click(segment);

    const codeInput = screen.getByLabelText('Course Code');
    fireEvent.change(codeInput, { target: { value: 'code' } });

    const nameInput = screen.getByLabelText('Course Name');
    fireEvent.change(nameInput, { target: { value: 'name' } });

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);
    
    // Modal is closed
    await waitFor(() => expect(screen.queryByText('You can attach this project to a course.')).toBeNull());
  });

});