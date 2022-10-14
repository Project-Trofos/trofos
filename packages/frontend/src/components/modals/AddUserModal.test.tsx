import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import '../../mocks/antd';

import AddUserModal from './AddUserModal';
import store from '../../app/store';
import server from '../../mocks/server';
import momentMock from '../../mocks/moment';

describe('test AddUserModal', () => {
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
        <AddUserModal />
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

  it('should render modal with correct fields', async () => {
    const { baseElement } = await setup();

    // Open modal
    const button = screen.getByText(/create user/i);
    fireEvent.click(button);

    // Ensure fields are present
    expect(screen.getByLabelText('User Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should require user email', async () => {
    await setup();

    const button = screen.getByText('Create User');
    fireEvent.click(button);

    const createButton = await screen.findByText('Create');
    fireEvent.click(createButton);

    await screen.findByText("Please input the user's email!");
  });

  it('should require that both passwords are the same and at least 8 characters long', async () => {
      await setup();

      const button = screen.getByText('Create User');
      fireEvent.click(button);

      const passwordField = await screen.findByLabelText(/^password/i);
      fireEvent.change(passwordField, { target: { value: 'short' } });

      const confirmPasswordField = await screen.findByLabelText(/confirm password/i);
      fireEvent.change(confirmPasswordField, { target: { value: 'shor' } });

      const createButton = await screen.findByText('Create');
      fireEvent.click(createButton);

      await screen.findByText("The two passwords that you entered do not match!");
      await screen.findByText("Password must be atleast 8 characters long");
  })

});