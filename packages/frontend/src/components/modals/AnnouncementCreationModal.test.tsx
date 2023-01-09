import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import store from '../../app/store';
import server from '../../mocks/server';

import AnnouncementCreationModal from './AnnouncementCreationModal';

describe('test announcement creation modal', () => {
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
        <AnnouncementCreationModal courseId="1" />
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
    const button = screen.getByText(/new/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByLabelText(/announcement title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/announcement content/i)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should require announcement title', async () => {
    setup();

    const button = screen.getByText(/new/i);
    fireEvent.click(button);

    const finishButton = await screen.findByText(/finish/i);
    fireEvent.click(finishButton);

    await screen.findByText('Please input announcement title!');
  });

  it('should require announcement content', async () => {
    setup();

    const button = screen.getByText(/new/i);
    fireEvent.click(button);

    const title = screen.getByLabelText(/announcement title/i);
    fireEvent.change(title, { target: { value: 'title' } });

    const finishButton = screen.getByText(/finish/i);
    fireEvent.click(finishButton);

    await screen.findByText('Please input announcement content!');
  });

  it('should submit correctly if fields are typed in', async () => {
    const { baseElement } = setup();

    const button = screen.getByText(/new/i);
    fireEvent.click(button);

    const finishButton = await screen.findByText(/finish/i);

    const title = screen.getByLabelText(/announcement title/i);
    fireEvent.change(title, { target: { value: 'title' } });

    const content = screen.getByLabelText(/announcement content/i);
    fireEvent.change(content, { target: { value: 'content' } });

    fireEvent.click(finishButton);

    // Modal is closed
    await expectModalInvisible(baseElement);
  });
});
