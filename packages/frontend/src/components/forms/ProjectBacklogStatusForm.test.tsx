import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { BacklogStatusData } from '../../api/types';
import store from '../../app/store';
import ProjectBacklogStatusForm from './ProjectBacklogStatusForm';

describe('ProjectBacklogStatusForm test', () => {
  const mockStatuses: BacklogStatusData[] = [
    {
      project_id: 123,
      name: 'To do',
      type: 'todo',
      order: 1,
    },
    {
      project_id: 123,
      name: 'In progress',
      type: 'in_progress',
      order: 1,
    },
    {
      project_id: 123,
      name: 'Done',
      type: 'done',
      order: 1,
    },
  ];

  function renderForm() {
    return render(
      <Provider store={store}>
        <ProjectBacklogStatusForm statuses={mockStatuses} />
      </Provider>,
    );
  }

  describe('when rendering', () => {
    it('should render according to the snapshot', () => {
      const { baseElement } = renderForm();
      expect(baseElement).toMatchSnapshot();
    });
  });
});
