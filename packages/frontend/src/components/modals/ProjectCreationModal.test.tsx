import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import '../../mocks/antd';

import ProjectCreationModal from './ProjectCreationModal';
import store from '../../app/store';
import server from '../../mocks/server';
import dayjsMock from '../../mocks/dayjs';

describe('test ProjectCreationModal', () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.

  afterEach(() => server.resetHandlers());

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  const setup = async () => {
    const { baseElement, debug } = render(
      <Provider store={store}>
        <ProjectCreationModal />
      </Provider>,
    );

    return { baseElement, debug };
  };

  const goToSecondStep = async () => {
    const setupData = await setup();
    const button = screen.getByText('Create Project');
    fireEvent.click(button);

    const nextButton = await screen.findByText('Next');
    const pnameInput = screen.getByLabelText('Name');

    fireEvent.change(pnameInput, { target: { value: 'pname' } });
    fireEvent.click(nextButton);

    await screen.findByText('You can attach this project to a course.');

    return setupData;
  };

  // Antd modal is rendered outside of `root` div and does not get unmounted after closing
  const expectModalInvisible = async (baseElement: HTMLElement) => {
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const modalWrapper = baseElement.getElementsByClassName('ant-modal-wrap');
    expect(modalWrapper.length).toBe(1);
    await waitFor(() => expect(modalWrapper[0]).toHaveStyle('display: none'));
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

  it('should require project name', async () => {
    await setup();

    const button = screen.getByText('Create Project');
    fireEvent.click(button);

    const nextButton = await screen.findByText('Next');
    fireEvent.click(nextButton);

    await screen.findByText("Please input your project's name!");
  });

  it('should be able to go to second step', async () => {
    await goToSecondStep();
  });

  it('should allow skipping course step by selecting independent project', async () => {
    const { baseElement } = await goToSecondStep();
    const segment = screen.getByText('Independent');
    fireEvent.click(segment);

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);

    await expectModalInvisible(baseElement);
  });

  it('should allow choosing a course from existing courses', async () => {
    const { baseElement } = await goToSecondStep();
    const segment = screen.getByText(/existing/i);
    fireEvent.click(segment);

    // Wait for data from API to load
    await screen.findByText('CS3203', { exact: false });
    const courseInput = await screen.findByLabelText('Course');
    fireEvent.change(courseInput, { target: { value: 'CS3203' } });

    const yearInput = await screen.findByLabelText('Academic Year');
    fireEvent.change(yearInput, { target: { value: dayjsMock } });

    const semInput = await screen.findByLabelText('Semester');
    fireEvent.change(semInput, { target: { value: '1' } });

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);

    await expectModalInvisible(baseElement);
  });

  it('should submit correctly if fields are typed in', async () => {
    const { baseElement } = await goToSecondStep();

    const segment = screen.getByText(/create new/i);
    fireEvent.click(segment);

    const codeInput = screen.getByLabelText('Course Code');
    fireEvent.change(codeInput, { target: { value: 'code' } });

    const nameInput = screen.getByLabelText('Course Name');
    fireEvent.change(nameInput, { target: { value: 'name' } });

    const yearInput = screen.getByLabelText('Academic Year');
    fireEvent.change(yearInput, { target: { value: '2022' } });

    const semesterInput = screen.getByLabelText('Semester');
    fireEvent.change(semesterInput, { target: { value: '1' } });

    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);

    // Modal is closed
    await expectModalInvisible(baseElement);
  });
});
