import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import BacklogCreationModal from './BacklogCreationModal';
import store from '../../app/store';
import server from '../../mocks/server';

describe('BacklogModal tests', () => {
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
        <BacklogCreationModal />
      </Provider>,
    );

    // Open modal
    const button = screen.getByText(/New Backlog/i);
    fireEvent.click(button);

    return { baseElement, debug };
  };

  it('renders new backlog modal with correct fields', () => {
    const { baseElement } = setup();

    // Ensure fields are present
    expect(screen.getByPlaceholderText('* Type summary here...')).toBeInTheDocument();
    expect(screen.getByText('Type of backlog')).toBeInTheDocument();
    expect(screen.getByText('Select Sprint')).toBeInTheDocument();
    expect(screen.getByText('Select Priority')).toBeInTheDocument();
    expect(screen.getByText('Select User')).toBeInTheDocument();
    expect(screen.getByText('Assign to')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description...')).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should sort sprints by ID descending', async () => {
    setup();

    // Ensure sprints are sorted by ID descending
    const sprintSelect = screen.getByText('Select Sprint');
    fireEvent.mouseDown(sprintSelect);

    const sprintOptions = await screen.findAllByText((content, element) => {
      if (!element) {
        return false;
      }
      return element.classList.contains('ant-select-item-option-content') && /TestSprint/i.test(content);
    });

    const sprintIds = sprintOptions.map((option) => option.textContent);

    expect(sprintIds).toEqual(['TestSprint last', 'TestSprint x', 'TestSprint 3', 'TestSprint 1']);
  })
});
