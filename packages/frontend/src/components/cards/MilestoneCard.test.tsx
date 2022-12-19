import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '../../mocks/antd';

import store from '../../app/store';
import server from '../../mocks/server';
import MilestoneCard from './MilestoneCard';
import { MSW_COURSE } from '../../mocks/handlers';

describe('test course creation modal', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const setup = () => {
    const { baseElement, debug } = render(
      <Provider store={store}>
        <MilestoneCard courseId={MSW_COURSE.id.toString()} />
      </Provider>,
    );
    return { baseElement, debug };
  };

  describe('when rendering', () => {
    it('should render correct fields', async () => {
      const { baseElement } = setup();
      for (const milestone of MSW_COURSE.milestones) {
        // eslint-disable-next-line no-await-in-loop
        await screen.findByText(milestone.name);
      }

      expect(baseElement).toMatchSnapshot();
    });
  });
});
