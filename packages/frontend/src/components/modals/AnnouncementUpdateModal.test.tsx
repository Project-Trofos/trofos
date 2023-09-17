import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import store from '../../app/store';

import AnnouncementUpdateModal from './AnnouncementUpdateModal';

describe('test announcement update modal', () => {
  const initialContent = 'INITIAL_CONTENT';
  const initialTitle = 'INITIAL_TITLE';

  const setup = () => {
    const updateFunc = vi.fn();
    const { baseElement, debug } = render(
      <Provider store={store}>
        <AnnouncementUpdateModal
          initialContent={initialContent}
          initialTitle={initialTitle}
          handleUpdate={updateFunc}
        />
      </Provider>,
    );
    return { baseElement, debug, updateFunc };
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
    const button = screen.getByRole('button', { name: /open-form/i });
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByLabelText(/announcement title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/announcement content/i)).toBeInTheDocument();

    // Expect initial values to be shown
    expect(screen.getByDisplayValue(initialTitle)).toBeInTheDocument();
    expect(screen.getByDisplayValue(initialContent)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should require announcement title', async () => {
    setup();

    const button = screen.getByRole('button', { name: /open-form/i });
    fireEvent.click(button);

    const title = screen.getByLabelText(/announcement title/i);
    fireEvent.change(title, { target: { value: '' } });

    const finishButton = await screen.findByText(/finish/i);
    fireEvent.click(finishButton);

    await screen.findByText('Please input announcement title!');
  });

  it('should require announcement content', async () => {
    setup();

    const button = screen.getByRole('button', { name: /open-form/i });
    fireEvent.click(button);

    const content = screen.getByLabelText(/announcement content/i);
    fireEvent.change(content, { target: { value: '' } });

    const finishButton = screen.getByText(/finish/i);
    fireEvent.click(finishButton);

    await screen.findByText('Please input announcement content!');
  });

  it('should submit correctly if fields are typed in', async () => {
    const { baseElement, updateFunc } = setup();

    const UPDATED_TITLE = 'UPDATED_TITLE';
    const UPDATED_CONTENT = 'UPDATED_CONTENT';

    const button = screen.getByRole('button', { name: /open-form/i });
    fireEvent.click(button);

    const finishButton = await screen.findByText(/finish/i);

    const title = screen.getByLabelText(/announcement title/i);
    fireEvent.change(title, { target: { value: UPDATED_TITLE } });

    const content = screen.getByLabelText(/announcement content/i);
    fireEvent.change(content, { target: { value: UPDATED_CONTENT } });

    fireEvent.click(finishButton);

    // Modal is closed
    await expectModalInvisible(baseElement);

    expect(updateFunc).toBeCalledWith({
      announcementTitle: UPDATED_TITLE,
      announcementContent: UPDATED_CONTENT,
    });
  });
});
