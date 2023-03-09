import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SimpleModal from './SimpleModal';

describe('test ProjectCreationModal', () => {
  // Antd modal is rendered outside of `root` div and does not get unmounted after closing
  const expectModalInvisible = async (baseElement: HTMLElement) => {
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const modalWrapper = baseElement.getElementsByClassName('ant-modal-wrap');
    expect(modalWrapper.length).toBe(1);
    await waitFor(() => expect(modalWrapper[0]).toHaveStyle('display: none'));
  };

  const BUTTON_NAME = 'a button';
  const TITLE = 'this is a title';
  const TEXT = 'hi there';

  it('should render modal correctly', async () => {
    const { baseElement } = render(
      <SimpleModal buttonName={BUTTON_NAME} title={TITLE}>
        {TEXT}
      </SimpleModal>,
    );

    // Open modal
    const button = screen.getByText(BUTTON_NAME);
    fireEvent.click(button);

    // Ensure inner element is present
    expect(screen.getByText(TEXT)).toBeInTheDocument();

    // Can be closed
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    await expectModalInvisible(baseElement);
  });
});
