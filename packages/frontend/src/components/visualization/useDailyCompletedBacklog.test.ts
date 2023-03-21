import { renderHook } from '@testing-library/react';
import dayjs from 'dayjs';
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
      expect(result.current).toStrictEqual([{ date: '2023-01-02', value: 10 }]);

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

    it('should fill the gap between daily completed backlogs with zero entries', () => {
      const GAP = 10;
      const history = [
        ...validBacklogHistory,
        ...validBacklogHistory.map((v) => ({
          ...v,
          backlog_id: 2,
          date: dayjs(v.date).add(GAP, 'day').toISOString(),
        })),
      ];

      const { result } = renderHook(() => useDailyCompletedPoints(history));

      expect(result.current).toHaveLength(1 + GAP);

      // Expect values are correct
      expect(result.current[0].value).toBe(10);
      for (let i = 1; i < GAP; i += 1) {
        expect(result.current[i].value).toBe(0);
      }
      expect(result.current[GAP].value).toBe(10);

      // Expect dates have no gaps
      for (let i = 0; i <= GAP; i += 1) {
        expect(result.current[i].date).toBe(dayjs(validBacklogHistory[1].date).add(i, 'day').format('YYYY-MM-DD'));
      }
    });
  });
});
