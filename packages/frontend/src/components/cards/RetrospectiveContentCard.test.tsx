import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import RetrospectiveContentCard from './RetrospectiveContentCard';
import store from '../../app/store';
import { Retrospective, RetrospectiveType } from '../../api/types';

describe('RetrospectiveContentCard test', () => {
  const setup = (retro: Retrospective) => {
    const { baseElement, debug } = render(
      <Provider store={store}>
        <RetrospectiveContentCard retroEntry={retro} />
      </Provider>,
    );

    return { baseElement, debug };
  };

  const MOCK_RETRO_ENTRY: Retrospective = {
    id: 1,
    sprint_id: 1,
    content: 'Retrospective text',
    type: RetrospectiveType.ACTION,
    score: 1,
    votes: [],
    is_action_taken: false,
  };

  it('renders retrospective card with correct details', () => {
    const { baseElement } = setup(MOCK_RETRO_ENTRY);
    expect(screen.getByText(MOCK_RETRO_ENTRY.content)).toBeInTheDocument();
    expect(screen.getByText(MOCK_RETRO_ENTRY.score)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });

  it('should have non-disabled create button if is_action_taken is false in action retrospective', () => {
    const { baseElement } = setup(MOCK_RETRO_ENTRY);
    screen.debug();
    // get create button
    const createButton = screen.getByRole('button', { name: /create/i });

    // Assert that the button is not disabled
    expect(createButton).not.toBeDisabled();
  });

  it('should have disabled create button if is_action_taken is true', () => {
    const { baseElement } = setup({
      ...MOCK_RETRO_ENTRY,
      is_action_taken: true
    });
    screen.debug();
    // get create button
    const createButton = screen.getByRole('button', { name: /create/i });

    // Assert that the button is disabled
    expect(createButton).toBeDisabled();
  })
});
