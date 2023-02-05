import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import RetrospectiveContentCard from './RetrospectiveContentCard';
import store from '../../app/store';
import { Retrospective, RetrospectiveType } from '../../api/types';

describe('RetrospectiveContentCard test', () => {
  const MOCK_RETRO_ENTRY: Retrospective = {
    id: 1,
    sprint_id: 1,
    content: 'Retrospective text',
    type: RetrospectiveType.POSITIVE,
    score: 1,
    votes: [],
  };

  const { baseElement } = render(
    <Provider store={store}>
      <RetrospectiveContentCard retroEntry={MOCK_RETRO_ENTRY} />
    </Provider>,
  );

  it('renders retrospective card with correct details', () => {
    expect(screen.getByText(MOCK_RETRO_ENTRY.content)).toBeInTheDocument();
    expect(screen.getByText(MOCK_RETRO_ENTRY.score)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
