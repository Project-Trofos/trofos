import { renderHook } from '@testing-library/react';
import dayjs from 'dayjs';
import { BacklogHistory, BacklogHistoryType, BacklogStatus } from '../../api/types';
import { useBurndownChart } from './useBurndownChart';
import { Sprint } from '../../api/sprint';

describe('useBurndownChart hook test', () => {
  const mockSprintId = 901;
  const dummySprintEndDate = new Date();
  dummySprintEndDate.setDate(dummySprintEndDate.getDate() + 1);
  const mockSprint: Sprint = {
    id: mockSprintId,
    name: 'Test',
    duration: 1,
    goals: '',
    start_date: '2022-10-10T06:03:56.000Z',
    end_date: dummySprintEndDate.toISOString(), // simulate this sprint hasnt ended so there will ne 'Now' dummmy point
    project_id: 903,
    status: 'current',
    backlogs: [],
  };
  const mockBacklogHistory: BacklogHistory[] = [
    {
      project_id: 903,
      backlog_id: 2,
      sprint_id: mockSprintId,
      history_type: BacklogHistoryType.CREATE,
      type: 'story',
      priority: 'high',
      reporter_id: 901,
      assignee_id: 902,
      points: 2,
      status: BacklogStatus.TODO,
      date: '2022-10-10T07:03:56.000Z',
    },
    {
      project_id: 903,
      backlog_id: 1,
      sprint_id: mockSprintId,
      history_type: BacklogHistoryType.CREATE,
      type: 'story',
      priority: 'very_high',
      reporter_id: 901,
      assignee_id: 902,
      points: 2,
      status: BacklogStatus.TODO,
      date: '2022-10-09T07:03:56.000Z',
    },
    {
      project_id: 903,
      backlog_id: 5,
      sprint_id: mockSprintId,
      history_type: BacklogHistoryType.CREATE,
      type: 'bug',
      priority: 'very_low',
      reporter_id: 901,
      assignee_id: 901,
      points: 2,
      status: BacklogStatus.TODO,
      date: '2022-10-13T07:03:56.000Z',
    },
    {
      project_id: 903,
      backlog_id: 4,
      sprint_id: mockSprintId,
      history_type: BacklogHistoryType.CREATE,
      type: 'bug',
      priority: 'low',
      reporter_id: 901,
      assignee_id: 902,
      points: 3,
      status: BacklogStatus.TODO,
      date: '2022-10-12T07:03:56.000Z',
    },
    {
      project_id: 903,
      backlog_id: 3,
      sprint_id: mockSprintId,
      history_type: BacklogHistoryType.UPDATE,
      type: 'task',
      priority: 'medium',
      reporter_id: 901,
      assignee_id: 901,
      points: 20,
      status: BacklogStatus.TODO,
      date: '2023-01-12T10:51:45.418Z',
    },
    {
      project_id: 903,
      backlog_id: 5,
      sprint_id: mockSprintId,
      history_type: BacklogHistoryType.UPDATE,
      type: 'bug',
      priority: 'very_low',
      reporter_id: 901,
      assignee_id: 901,
      points: 66,
      status: BacklogStatus.TODO,
      date: '2023-01-12T10:56:28.107Z',
    },
    {
      project_id: 903,
      backlog_id: 5,
      sprint_id: mockSprintId,
      history_type: BacklogHistoryType.UPDATE,
      type: 'bug',
      priority: 'very_low',
      reporter_id: 901,
      assignee_id: 901,
      points: 2,
      status: BacklogStatus.TODO,
      date: '2023-01-12T10:58:41.798Z',
    },
    {
      project_id: 903,
      backlog_id: 3,
      sprint_id: mockSprintId,
      history_type: BacklogHistoryType.UPDATE,
      type: 'task',
      priority: 'medium',
      reporter_id: 901,
      assignee_id: 901,
      points: 2,
      status: BacklogStatus.TODO,
      date: '2023-01-12T10:58:48.355Z',
    },
    {
      project_id: 903,
      backlog_id: 3,
      sprint_id: mockSprintId,
      history_type: BacklogHistoryType.CREATE,
      type: 'task',
      priority: 'medium',
      reporter_id: 901,
      assignee_id: 901,
      points: 1,
      status: BacklogStatus.TODO,
      date: '2022-10-11T07:03:56.000Z',
    },
  ];

  describe('when provided with backlog history and sprint id', () => {
    it('sorts the backlog history in ascending time order', () => {
      const { result } = renderHook(() => useBurndownChart(mockBacklogHistory, mockSprint));

      const sortedBacklog = result.current.backlogSorted;

      // Order must be correct
      for (let i = 0; i < sortedBacklog.length - 1; i += 1) {
        expect(dayjs(sortedBacklog[i].date).isBefore(sortedBacklog[i + 1].date)).toBeTruthy();
      }

      expect(result.current.backlogSorted.length).toBe(mockBacklogHistory.length);
    });

    it('sorts the backlog history to be grouped by backlog id', () => {
      const { result } = renderHook(() => useBurndownChart(mockBacklogHistory, mockSprint));

      const groups = result.current.backlogGrouped;
      let numHistory = 0;

      for (const [id, group] of Object.entries(groups)) {
        // Sorted by date ascending
        for (let i = 0; i < group.length - 1; i += 1) {
          expect(dayjs(group[i].date).isBefore(group[i + 1].date)).toBeTruthy();
        }

        // Grouped with the same id
        for (const backlogHistory of group) {
          expect(backlogHistory.backlog_id).toEqual(Number(id));
          numHistory += 1;
        }
      }

      // Same number of items
      expect(numHistory).toBe(mockBacklogHistory.length);
    });

    // A create todo history
    const baseHistory: BacklogHistory = {
      project_id: 903,
      backlog_id: 3,
      sprint_id: mockSprintId,
      history_type: BacklogHistoryType.CREATE,
      type: 'task',
      priority: 'medium',
      reporter_id: 901,
      assignee_id: 901,
      points: 1,
      status: BacklogStatus.TODO,
      date: '2022-10-11T07:03:56.000Z',
    };

    const nextDay = '2022-10-12T07:03:56.000Z';
    const prevDay = '2022-10-10T07:03:56.000Z';

    it('returns the correct story point array for create', () => {
      const history: BacklogHistory[] = [baseHistory];
      const { result } = renderHook(() => useBurndownChart(history, mockSprint));

      // Skip the first dummy points
      expect(result.current.storyPointData[1].point).toBe(baseHistory.points);
      expect(result.current.storyPointData[1].date).toStrictEqual(new Date(baseHistory.date));
      expect(result.current.storyPointData[1].type).toStrictEqual(BacklogHistoryType.CREATE);
    });

    it('returns the correct story point array for update backlog (no change)', () => {
      const history: BacklogHistory[] = [
        baseHistory,
        // These updates do not affect story point
        {
          ...baseHistory,
          history_type: BacklogHistoryType.UPDATE,
          date: nextDay,
          assignee_id: 111,
          priority: 'high',
          reporter_id: 222,
          type: 'bug',
        },
      ];
      const { result } = renderHook(() => useBurndownChart(history, mockSprint));

      // Includes 2 dummy points
      expect(result.current.storyPointData.length).toBe(1 + 2);
      expect(result.current.storyPointData[0].point).toBe(0);
      expect(result.current.storyPointData[1].point).toBe(baseHistory.points);
      expect(result.current.storyPointData[2].point).toBe(baseHistory.points);
    });

    it('returns the correct story point array for update backlog (To do => Done)', () => {
      const history: BacklogHistory[] = [
        baseHistory,
        {
          ...baseHistory,
          history_type: BacklogHistoryType.UPDATE,
          status: BacklogStatus.DONE,
          date: "2022-10-12T07:03:56.000Z",
        },
      ];
      
      const { result } = renderHook(() => useBurndownChart(history, mockSprint));

      // Include 2 dummy points
      expect(result.current.storyPointData.length).toBe(2 + 2);
      expect(result.current.storyPointData[0].point).toBe(0);
      expect(result.current.storyPointData[1].point).toBe(1);
      // The story point in the end should be 0
      expect(result.current.storyPointData[2].point).toBe(0);
      expect(result.current.storyPointData[3].point).toBe(0);
    });

    it('returns the correct story point array for update backlog (To do => Done => To do)', () => {
      const history: BacklogHistory[] = [
        { ...baseHistory, date: prevDay },
        { ...baseHistory, history_type: BacklogHistoryType.UPDATE, status: BacklogStatus.DONE, },
        { ...baseHistory, history_type: BacklogHistoryType.UPDATE, date: nextDay, status: BacklogStatus.TODO },
      ];
      const { result } = renderHook(() => useBurndownChart(history, mockSprint));

      // Include 2 dummy points
      expect(result.current.storyPointData.length).toBe(3 + 2);
      expect(result.current.storyPointData[0].point).toBe(0);
      expect(result.current.storyPointData[1].point).toBe(1);
      expect(result.current.storyPointData[2].point).toBe(0);
      // Story point back to 1
      expect(result.current.storyPointData[3].point).toBe(1);
      expect(result.current.storyPointData[4].point).toBe(1);
    });

    it('returns the correct story point array for update backlog (To do => In progress)', () => {
      const history: BacklogHistory[] = [
        baseHistory,
        { ...baseHistory, history_type: BacklogHistoryType.UPDATE, status: 'In progress', date: nextDay },
      ];
      const { result } = renderHook(() => useBurndownChart(history, mockSprint));

      // Include 2 dummy points
      expect(result.current.storyPointData.length).toBe(2 + 2);
      expect(result.current.storyPointData[0].point).toBe(0);
      expect(result.current.storyPointData[1].point).toBe(1);
      // Same point
      expect(result.current.storyPointData[2].point).toBe(1);
      expect(result.current.storyPointData[3].point).toBe(1);
    });

    it('returns the correct story point array for update backlog (Increase point)', () => {
      const history: BacklogHistory[] = [
        baseHistory,
        {
          ...baseHistory,
          history_type: BacklogHistoryType.UPDATE,
          points: (baseHistory.points as number) + 1,
          date: nextDay,
        },
      ];
      const { result } = renderHook(() => useBurndownChart(history, mockSprint));

      // Include 2 dummy points
      expect(result.current.storyPointData.length).toBe(2 + 2);
      expect(result.current.storyPointData[0].point).toBe(0);
      expect(result.current.storyPointData[1].point).toBe(1);
      // Added one point
      expect(result.current.storyPointData[2].point).toBe(2);
      expect(result.current.storyPointData[3].point).toBe(2);
    });

    it('returns the correct story point array for update backlog (Decrease point)', () => {
      const history: BacklogHistory[] = [
        baseHistory,
        {
          ...baseHistory,
          history_type: BacklogHistoryType.UPDATE,
          points: (baseHistory.points as number) - 1,
          date: nextDay,
        },
      ];
      const { result } = renderHook(() => useBurndownChart(history, mockSprint));

      // Include 2 dummy points
      expect(result.current.storyPointData.length).toBe(2 + 2);
      expect(result.current.storyPointData[0].point).toBe(0);
      expect(result.current.storyPointData[1].point).toBe(1);
      // Minus one point
      expect(result.current.storyPointData[2].point).toBe(0);
      expect(result.current.storyPointData[3].point).toBe(0);
    });

    it('returns the correct story point array for delete backlog', () => {
      const history: BacklogHistory[] = [
        baseHistory,
        { ...baseHistory, history_type: BacklogHistoryType.DELETE, date: nextDay },
      ];
      const { result } = renderHook(() => useBurndownChart(history, mockSprint));

      // Include 2 dummy points
      expect(result.current.storyPointData.length).toBe(2 + 2);
      expect(result.current.storyPointData[0].point).toBe(0);
      expect(result.current.storyPointData[1].point).toBe(1);
      expect(result.current.storyPointData[2].point).toBe(0);
      expect(result.current.storyPointData[3].point).toBe(0);
    });

    it('aggregates the story points before sprint start', () => {
      const history: BacklogHistory[] = [
        {
          project_id: 903,
          backlog_id: 3,
          sprint_id: mockSprintId,
          history_type: BacklogHistoryType.CREATE,
          type: 'task',
          priority: 'medium',
          reporter_id: 901,
          assignee_id: 901,
          points: 1,
          status: BacklogStatus.TODO,
          date: '2022-10-10T05:03:56.000Z',
        },
        {
          project_id: 903,
          backlog_id: 4,
          sprint_id: mockSprintId,
          history_type: BacklogHistoryType.CREATE,
          type: 'task',
          priority: 'medium',
          reporter_id: 901,
          assignee_id: 901,
          points: 2,
          status: BacklogStatus.TODO,
          date: '2022-10-10T05:59:56.000Z',
        },
        baseHistory,
      ];
      const { result } = renderHook(() => useBurndownChart(history, mockSprint));
      // Include 1 dummy points for Now. Start point with before start aggregated data
      expect(result.current.storyPointData.length).toBe(2 + 1);
      expect(result.current.storyPointData[0].message).toBe(`Start\nIssue 3 created. Story point +1.\nIssue 4 created. Story point +2.`);
      expect(result.current.storyPointData[1].message).toBe('Issue 3 created. Story point +1.');
      expect(result.current.storyPointData[2].message).toBe('Now');
    });

    it('should aggregate data within the same hour on same day', () => {
      const history: BacklogHistory[] = [
        {
          project_id: 903,
          backlog_id: 3,
          sprint_id: mockSprintId,
          history_type: BacklogHistoryType.CREATE,
          type: 'task',
          priority: 'medium',
          reporter_id: 901,
          assignee_id: 901,
          points: 1,
          status: BacklogStatus.TODO,
          date: '2022-10-09T15:03:56.000Z', // check only aggregate same day
        },
        {
          project_id: 903,
          backlog_id: 3,
          sprint_id: mockSprintId,
          history_type: BacklogHistoryType.CREATE,
          type: 'task',
          priority: 'medium',
          reporter_id: 901,
          assignee_id: 901,
          points: 1,
          status: BacklogStatus.TODO,
          date: '2022-10-10T15:03:56.000Z',
        },
        {
          project_id: 903,
          backlog_id: 3,
          sprint_id: mockSprintId,
          history_type: BacklogHistoryType.CREATE,
          type: 'task',
          priority: 'medium',
          reporter_id: 901,
          assignee_id: 901,
          points: 1,
          status: BacklogStatus.TODO,
          date: '2022-10-10T15:59:56.000Z',
        },
      ];

      const { result } = renderHook(() => useBurndownChart(history, mockSprint));
      // Include 1 dummy points for Now. Start point with first data, next 2 are aggregated together
      expect(result.current.storyPointData.length).toBe(2 + 1);
      expect(result.current.storyPointData[0].message).toBe('Start\nIssue 3 created. Story point +1.');
      expect(result.current.storyPointData[1].message).toBe('Issue 3 created. Story point +1.\nIssue 3 created. Story point +1.');
      expect(result.current.storyPointData[2].message).toBe('Now');
    });
  });
});
