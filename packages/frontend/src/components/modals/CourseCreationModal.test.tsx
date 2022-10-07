import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import '../../mocks/antd';

import CourseCreationModal from './CourseCreationModal';
import store from '../../app/store';
import server from '../../mocks/server';
import momentMock from '../../mocks/moment';

describe('test course creation modal', () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.

  afterEach(() => server.resetHandlers());

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  const setup = () => {
    const { baseElement, debug } = render(
      <Provider store={store}>
        <CourseCreationModal />
      </Provider>,
    );
    return { baseElement, debug };
  };

  // Antd modal is rendered outside of `root` div and does not get unmounted after closing
  const expectModalInvisible = async (baseElement: HTMLElement) => {
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const modalWrapper = baseElement.getElementsByClassName('ant-modal-wrap');
    expect(modalWrapper.length).toBe(1);
    await waitFor(() => expect(modalWrapper[0]).toHaveStyle('display: none'));
  };

  it('should render modal with correct fields', () => {
    const { baseElement } = setup();

    // Open modal
    const button = screen.getByText(/create course/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/course code/i)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should be required course name', async () => {
    setup();

    const button = screen.getByText(/create course/i);
    fireEvent.click(button);

    const finishButton = await screen.findByText(/finish/i);
    fireEvent.click(finishButton);

    await screen.findByText("Please input your course's name!");
  });

  it('should submit correctly if fields are typed in', async () => {
    const { baseElement } = setup();
    const button = screen.getByText(/create course/i);
    fireEvent.click(button);
    const finishButton = await screen.findByText(/finish/i);

    const input = screen.getByLabelText(/course name/i);
    fireEvent.change(input, { target: { value: 'name' } });

    const yearInput = screen.getByLabelText('Academic Year');
    fireEvent.change(yearInput, { target: { value: momentMock } });

    const semesterInput = screen.getByLabelText('Semester');
    fireEvent.change(semesterInput, { target: { value: '1' } });

    fireEvent.click(finishButton);

    expect(momentMock.year()).toBe('2022');

    // Modal is closed
    expectModalInvisible(baseElement);
  });
});
