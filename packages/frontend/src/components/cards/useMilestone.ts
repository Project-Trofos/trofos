import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Milestone } from '../../api/types';

export type MilestoneStatus = 'process' | 'finish' | undefined;

// Logic for converting string dates into Dayjs objects
// Also provide ordering and milestone status
export function useMilestone(rawMilestones?: Milestone[]) {
  const milestones = useMemo(() => {
    return rawMilestones
      ?.map((m) => {
        return {
          ...m,
          created_at: dayjs(m.created_at),
          deadline: dayjs(m.deadline),
          start_date: dayjs(m.start_date),
        };
      })
      .sort((a, b) => a.start_date.diff(b.start_date));
  }, [rawMilestones]);

  const statuses: MilestoneStatus[] = useMemo(() => {
    if (!milestones) {
      return [];
    }

    const today = dayjs();

    return milestones.map((m) => {
      if (today.isBefore(m.deadline) && today.isAfter(m.start_date)) {
        return 'process';
      }
      if (today.isAfter(m.deadline)) {
        return 'finish';
      }
      return undefined;
    });
  }, [milestones]);

  return {
    milestones,
    statuses,
  };
}
