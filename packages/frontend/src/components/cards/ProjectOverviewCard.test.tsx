import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectOverviewCard from './ProjectOverviewCard';
import { MSW_BACKLOG_HISTORY, MSW_SPRINT } from '../../mocks/handlers';

describe('ProjectOverviewCard test', () => {
  describe('when there are no active sprint', () => {
    it('renders card with prompt about no active sprint', () => {
      render(<ProjectOverviewCard sprints={[MSW_SPRINT[0]]} backlogHistory={[]} unassignedBacklogs={[]} />);
      expect(screen.getByText('no active sprint', { exact: false })).toBeInTheDocument();
    });
  });

  describe('when there is active sprint', () => {
    it('renders card correctly', () => {
      const { baseElement } = render(
        <ProjectOverviewCard sprints={MSW_SPRINT} backlogHistory={MSW_BACKLOG_HISTORY} unassignedBacklogs={[]} />,
      );

      expect(baseElement).toMatchSnapshot();
    });
  });
});
