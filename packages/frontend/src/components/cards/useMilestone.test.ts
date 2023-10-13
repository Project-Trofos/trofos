import { renderHook } from '@testing-library/react';
import dayjs, { Dayjs } from 'dayjs';
import { MilestoneStatus, useMilestone } from './useMilestone';

describe('useMilestone hook', () => {
  const milestones = [
    {
      id: 2,
      name: 'In Progress',
      course_id: 1,
      start_date: '2022-01-19T16:00:00.000Z',
      deadline: new Date(Date.now() + (3600 * 1000 * 24)).toString(),
      created_at: '2022-12-18T17:06:07.072Z',
    },
    {
      id: 1,
      name: 'Past',
      course_id: 1,
      start_date: '2021-01-09T16:00:00.000Z',
      deadline: '2021-12-31T16:00:00.000Z',
      created_at: '2022-12-18T17:06:07.072Z',
    },
    {
      id: 3,
      name: 'Future',
      course_id: 1,
      start_date: '2029-01-09T16:00:00.000Z',
      deadline: '2029-12-31T16:00:00.000Z',
      created_at: '2022-12-18T17:06:07.072Z',
    },
  ];

  describe('when input is milestone array', () => {
    it('should give correct outputs', () => {
      const { result } = renderHook(() => useMilestone(milestones));

      // Statuses
      expect(result.current.statuses).toHaveLength(milestones.length);
      expect(result.current.statuses).toStrictEqual<MilestoneStatus[]>(['finish', 'process', undefined]);

      // Reordered
      expect(result.current.milestones).not.toBeUndefined();
      if (!result.current.milestones) {
        throw new Error('milestone is undefined!');
      }
      expect(result.current.milestones[0].course_id).toBe(milestones[1].course_id);
      expect(result.current.milestones[1].course_id).toBe(milestones[0].course_id);
      expect(result.current.milestones[2].course_id).toBe(milestones[2].course_id);

      // Using dayjs object
      expect(dayjs.isDayjs(result.current.milestones[0].deadline)).toBeTruthy();
      expect(dayjs.isDayjs(result.current.milestones[1].deadline)).toBeTruthy();
      expect(dayjs.isDayjs(result.current.milestones[2].deadline)).toBeTruthy();
      expect(dayjs.isDayjs(result.current.milestones[0].start_date)).toBeTruthy();
      expect(dayjs.isDayjs(result.current.milestones[1].start_date)).toBeTruthy();
      expect(dayjs.isDayjs(result.current.milestones[2].start_date)).toBeTruthy();
      expect(dayjs.isDayjs(result.current.milestones[0].created_at)).toBeTruthy();
      expect(dayjs.isDayjs(result.current.milestones[1].created_at)).toBeTruthy();
      expect(dayjs.isDayjs(result.current.milestones[2].created_at)).toBeTruthy();
    });
  });

  describe('when input is empty array', () => {
    it('should return empty arrays', () => {
      const { result } = renderHook(() => useMilestone([]));

      expect(result.current.milestones).toStrictEqual([]);
      expect(result.current.statuses).toStrictEqual([]);
    });
  });

  describe('when input is undefined', () => {
    it('should return empty status array and undefined milestone', () => {
      const { result } = renderHook(() => useMilestone(undefined));

      expect(result.current.milestones).toBeUndefined();
      expect(result.current.statuses).toStrictEqual([]);
    });
  });
});
