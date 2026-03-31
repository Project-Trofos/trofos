import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import server from '../../mocks/server';
import ImportBacklogDataModal from './ImportBacklogDataModal';
import store from '../../app/store';

const mockFile = new File(['hello'], 'hello.csv', { type: 'text/csv' });

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ projectId: '1' }),
  };
});

describe('test import backlog data modal', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const setup = () => {
    const { baseElement } = render(
      <Provider store={store}>
        <ImportBacklogDataModal />
      </Provider>,
    );

    const button = screen.getByText(/import csv data/i);
    fireEvent.click(button);

    return { baseElement };
  };

  it('should display the components correctly', () => {
    const { baseElement } = setup();

    expect(screen.getByText(/select file/i)).toBeInTheDocument();
    expect(screen.getByText(/download csv template/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/^import$/i)).toBeInTheDocument();

    expect(baseElement).toMatchSnapshot();
  });

  it('should disable the import button when no files are selected', () => {
    setup();

    const button = screen.getByRole('button', { name: /^import$/i });
    expect(button).toBeDisabled();
  });

  it('should enable the import button when a file is selected', async () => {
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
