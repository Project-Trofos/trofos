import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectOverviewCard from './ProjectOverviewCard';
import { MSW_BACKLOG_HISTORY, MSW_SPRINT } from '../../mocks/handlers';

describe('ProjectOverviewCard test', () => {
  describe('when there are no active sprint', () => {
    it('renders card with prompt about no active sprint', () => {
      render(
        <BrowserRouter>
          <ProjectOverviewCard sprints={[MSW_SPRINT[0]]} backlogHistory={[]} unassignedBacklogs={[]} />
        </BrowserRouter>,
      );
      expect(screen.getByText('no active sprint', { exact: false })).toBeInTheDocument();
    });
  });

  describe('when there is active sprint', () => {
    it.skip('renders card correctly', () => {
      const { baseElement } = render(
        <BrowserRouter>
          <ProjectOverviewCard sprints={MSW_SPRINT} backlogHistory={MSW_BACKLOG_HISTORY} unassignedBacklogs={[]} />
        </BrowserRouter>,
      );

      expect(baseElement).toMatchSnapshot();
    });
  });
});
