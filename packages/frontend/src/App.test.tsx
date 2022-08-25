import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main page', async () => {
  render(<App />);
  const linkElement = await screen.findByText('Welcome to project Trofos', { exact: false });
  expect(linkElement).toBeInTheDocument();
});
