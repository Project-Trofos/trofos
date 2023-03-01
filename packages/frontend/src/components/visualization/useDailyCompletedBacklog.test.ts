import { renderHook } from '@testing-library/react';
import { BacklogHistory, BacklogHistoryType } from '../../api/types';
import useDailyCompletedPoints from './useDailyCompletedBacklog';

describe('test useDailyCompletedBacklog hook', () => {
  describe('when provided with valid data', () => {
    const validBacklogHistory: BacklogHistory[] = [
      {
        backlog_id: 1,
        date: '2023-1-1',
        history_type: BacklogHistoryType.CREATE,
        project_id: 1,
        reporter_id: 1,
        sprint_id: 1,
        type: 'story',
        status: 'To do',
        priority: 'high',
        points: 10,
        assignee_id: null,
      },
      {
        backlog_id: 1,
        date: '2023-1-2',
        history_type: BacklogHistoryType.UPDATE,
        project_id: 1,
        reporter_id: 1,
        sprint_id: 1,
        type: 'story',
        status: 'Done',
        priority: 'high',
        points: 10,
        assignee_id: null,
      },
    ];
    it('should return valid daily completed backlogs', () => {
      let history = validBacklogHistory;
      const { result, rerender } = renderHook(() => useDailyCompletedPoints(history));

      // Backlog completed
      expect(result.current).toStrictEqual([{ date: '02/01/2023', value: 10 }]);

      history = [history[0]];
      rerender();

      // Backlog not completed
      expect(result.current).toStrictEqual([]);

      history = [
        history[0],
        {
          backlog_id: 1,
          date: '2023-1-2',
          history_type: BacklogHistoryType.DELETE,
          project_id: 1,
          reporter_id: 1,
          sprint_id: 1,
          type: 'story',
          status: 'Done',
          priority: 'high',
          points: 10,
          assignee_id: null,
        },
      ];

      rerender();

      // Backlog deleted
      expect(result.current).toStrictEqual([]);
    });
  });
});
