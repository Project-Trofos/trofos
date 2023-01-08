import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import '../../mocks/antd';

import dayjs from 'dayjs';
import store from '../../app/store';
import MilestoneCreationModal from './MilestoneCreationModal';
import server from '../../mocks/server';

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
        <MilestoneCreationModal courseId="1" />
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
    const button = screen.getByText(/create milestone/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByLabelText(/milestone name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start and end dates/i)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should require milestone name', async () => {
    setup();

    const button = screen.getByText(/create milestone/i);
    fireEvent.click(button);

    const finishButton = await screen.findByText(/finish/i);
    fireEvent.click(finishButton);

    await screen.findByText('Please input milestone name!');
  });

  it('should require start and end dates', async () => {
    setup();

    const button = screen.getByText(/create milestone/i);
    fireEvent.click(button);

    const milestone = screen.getByLabelText(/milestone name/i);
    fireEvent.change(milestone, { target: { value: 'name' } });

    const finishButton = screen.getByText(/finish/i);
    fireEvent.click(finishButton);

    await screen.findByText('Please input start and end dates!');
  });

  it('should submit correctly if fields are typed in', async () => {
    const { baseElement } = setup();

    const button = screen.getByText(/create milestone/i);
    fireEvent.click(button);

    const finishButton = await screen.findByText(/finish/i);

    const milestone = screen.getByLabelText(/milestone name/i);
    fireEvent.change(milestone, { target: { value: 'name' } });

    const dates = screen.getByLabelText(/start and end dates/i);
    fireEvent.change(dates, { target: { value: [dayjs(), dayjs()] } });

    fireEvent.click(finishButton);

    // Modal is closed
    await expectModalInvisible(baseElement);
  });
});
