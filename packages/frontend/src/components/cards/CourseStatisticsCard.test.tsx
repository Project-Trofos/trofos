import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MSW_BACKLOG_HISTORY, MSW_PROJECT, MSW_SPRINT } from '../../mocks/handlers';
import CourseStatisticsCard from './CourseStatisticsCard';

describe('CourseStatisticsCard test', () => {
  describe('when it renders', () => {
    it.skip('should render card correctly', () => {
      const { baseElement } = render(
        <BrowserRouter>
          <CourseStatisticsCard
            projects={[MSW_PROJECT]}
            sprints={MSW_SPRINT}
            backlogHistory={MSW_BACKLOG_HISTORY}
            unassignedBacklogs={[]}
          />
        </BrowserRouter>,
      );

      expect(baseElement).toMatchSnapshot();
    });
  });
});
