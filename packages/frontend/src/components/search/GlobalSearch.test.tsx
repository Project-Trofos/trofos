import React from 'react';
import { findByText, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
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
    const { baseElement, debug } = render(
      <Provider store={store}>
        <BrowserRouter>
          <GlobalSearch />
        </BrowserRouter>
      </Provider>,
    );

    return { baseElement, debug };
  };

  describe('when rendered', () => {
    it('should show search input', async () => {
      await setup();

      const input = screen.getByPlaceholderText('type to search');

      fireEvent.change(input, { target: { value: 'p' } });

      await screen.findByText('project1');
    });
  });

  describe('when searching with valid keyword', () => {
    it('should show correct courses', async () => {
      await setup();

      const input = screen.getByPlaceholderText('type to search');

      fireEvent.change(input, { target: { value: 'project' } });

      await screen.findByText('project1');
    });

    it('should show correct projects', async () => {
      await setup();

      const input = screen.getByPlaceholderText('type to search');

      fireEvent.change(input, { target: { value: 'soft' } });

      await screen.findByText('Software Engineering Project');
    });
  });

  describe('when searching with invalid keyword', () => {
    it('should show no result', async () => {
      await setup();

      const input = screen.getByPlaceholderText('type to search');

      fireEvent.change(input, { target: { value: 'invalid project' } });

      await screen.findByText('No Result');
    });
  });
});
