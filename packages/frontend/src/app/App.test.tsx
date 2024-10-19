import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import store from './store';
import App from './App';

test('renders main page', async () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  const linkElement = await screen.findAllByText('TROFOS', { exact: false });
  expect(linkElement[0]).toBeInTheDocument();
});
