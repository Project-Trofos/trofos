import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import RetrospectiveContainerCard from './RetrospectiveContainerCard';
import store from '../../app/store';
import { RetrospectiveType } from '../../api/types';

describe('RetrospectiveContainerCard test', () => {
  const MOCK_SPRINT_ID = 1;
  const MOCK_TITLE = 'What went well?';
  const MOCK_TYPE = RetrospectiveType.POSITIVE;

  const { baseElement } = render(
    <Provider store={store}>
      <RetrospectiveContainerCard sprintId={MOCK_SPRINT_ID} title={MOCK_TITLE} type={MOCK_TYPE} />
    </Provider>,
  );

  it('renders retrospective card with correct details', () => {
    expect(screen.getByText(MOCK_TITLE)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
