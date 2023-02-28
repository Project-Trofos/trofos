import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import store from '../../app/store';
import type { Backlog } from '../../api/types';
import ScrumBoardCard from './ScrumBoardCard';
import StrictModeDroppable from '../dnd/StrictModeDroppable';

describe('ScrumBoardCard test', () => {
  const mockBacklog: Backlog = {
    backlog_id: 111,
    summary: 'A Test Summary',
    type: 'story',
    priority: 'very_high',
    sprint_id: 123,
    reporter_id: 1,
    assignee_id: 2,
    points: 3,
    description: 'A test description here',
    project_id: 123,
    status: 'todo',
    assignee: {
      created_at: '2022-12-26T04:19:07.531Z',
      project_id: 903,
      user_id: 2,
      user: {
        user_email: 'testBacklogUser2@test.com',
        user_display_name: 'Backlog User 2',
      },
    },
  };

  const mockProjectKey = 'TEST';
  const mockIndex = 0;
  const mockDroppableId = '0';
  const { baseElement } = render(
    <Provider store={store}>
      <BrowserRouter>
        <DragDropContext onDragEnd={jest.fn()}>
          <StrictModeDroppable droppableId={mockDroppableId}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <ScrumBoardCard backlog={mockBacklog} projectKey={mockProjectKey} index={mockIndex} />
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>
      </BrowserRouter>
    </Provider>,
  );

  it('renders scrum board card with correct details', () => {
    expect(screen.getByText(mockBacklog.summary)).toBeInTheDocument();
    expect(screen.getByText(mockBacklog.type)).toBeInTheDocument();
    expect(screen.getByText(mockBacklog?.points?.toString() as string)).toBeInTheDocument();

    // Compare with snapshot to ensure structure remains the same
    expect(baseElement).toMatchSnapshot();
  });
});
