import { renderHook } from '@testing-library/react';
import { Backlog } from '../../api/types';
import { MSW_SPRINT } from '../../mocks/handlers';
import useGroupSprintBacklog from './useGroupSprintBacklog';

describe('test useGroupSprintBacklog hook', () => {
  describe('when provided with valid data', () => {
    it('should return valid backlog groups', () => {
      let unassigned: Backlog[] = [];
      const { result, rerender } = renderHook(() => useGroupSprintBacklog([MSW_SPRINT[1]], unassigned));

      expect(result.current).toContainEqual({ type: 'In progress', value: 1 });
      expect(result.current).toContainEqual({ type: 'Done', value: 2 });

      unassigned = [
        {
          backlog_id: 333,
          project_id: MSW_SPRINT[1].project_id,
          reporter_id: 1,
          sprint_id: MSW_SPRINT[1].id,
          type: 'story',
          status: 'To do',
          priority: 'high',
          points: 10,
          assignee_id: null,
          assignee: null,
          description: null,
          summary: 'haha',
        },
      ];

      rerender();

      expect(result.current).toContainEqual({ type: 'In progress', value: 1 });
      expect(result.current).toContainEqual({ type: 'Done', value: 2 });
      expect(result.current).toContainEqual({ type: 'Backlog', value: 1 });
    });
  });
});
