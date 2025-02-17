import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import user from '@testing-library/user-event';
import server from '../../mocks/server';
import store from '../../app/store';
import ImportProjectAssignmentModal from './ImportProjectAssignmentModal';

const mockFile = new File(['hello'], 'hello.png', { type: 'image/png' });

describe('test import project assignment modal', () => {
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
        <ImportProjectAssignmentModal />
      </Provider>,
    );

    // Open modal
    const button = screen.getByText(/import project assignment csv/i);
    fireEvent.click(button);

    return { baseElement, debug };
  };

  it('should display the components correctly', () => {
    const { baseElement } = setup();

    // Ensure components are present
    expect(screen.getByText(/select file/i)).toBeInTheDocument();
    expect(screen.getByText(/download csv template/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/^import$/i)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should disable the import button when no files are selected', () => {
    setup();

    const button = screen.getByRole('button', { name: /^import$/i });
    expect(button).toBeDisabled();
  });

  it('should enable the import button when a file is selected to be uploaded', async () => {
    setup();
    const input = screen.getByTestId('upload-button') as HTMLInputElement;
    /* eslint-disable testing-library/no-unnecessary-act */
    await act(async () => {
      fireEvent.change(input, { target: { files: [mockFile] } });
    });
    /* eslint-enable */

    expect(input.files![0]).toStrictEqual(mockFile);
    expect(input.files).toHaveLength(1);

    const button = screen.getByRole('button', { name: /^import$/i });
    expect(button).toBeEnabled();
  });
});
