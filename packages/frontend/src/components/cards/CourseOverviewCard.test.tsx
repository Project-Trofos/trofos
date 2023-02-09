import React from 'react';
import { render } from '@testing-library/react';
import { MSW_BACKLOG_HISTORY, MSW_PROJECT, MSW_SPRINT } from '../../mocks/handlers';
import CourseOverviewCard from './CourseOverviewCard';

describe('CourseOverviewCard test', () => {
  describe('when it renders', () => {
    it('should render card correctly', () => {
      const { baseElement } = render(
        <CourseOverviewCard
          projects={[MSW_PROJECT]}
          sprints={MSW_SPRINT}
          backlogHistory={MSW_BACKLOG_HISTORY}
          unassignedBacklogs={[]}
        />,
      );

      expect(baseElement).toMatchSnapshot();
    });
  });
});
