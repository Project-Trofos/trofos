import dayjs from 'dayjs';
import { useMemo } from 'react';
import { BacklogHistory, BacklogHistoryType } from '../../api/types';

export default function useDailyCompletedPoints(backlogHistory: BacklogHistory[]) {
  const data = useMemo(() => {
    if (!backlogHistory) {
      return [];
    }
    const dailyCompletion = new Map<string, number>();

    // Completion dates of a backlog ID
    // (a backlog can be completed multiple times, we will only look at the last completion)
    const group = new Map<number, BacklogHistory[]>();
    for (const backlog of backlogHistory) {
      if (!group.has(backlog.backlog_id)) {
        group.set(backlog.backlog_id, []);
      }
      group.get(backlog.backlog_id)?.push(backlog);
    }

    for (const gp of Array.from(group.values())) {
      const groupSortedDesc = [...gp].sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
      const lastPoint = groupSortedDesc.find((g) => g.points !== null)?.points ?? 0;

      // If the last history is delete, then ignore this backlog since it is deleted
      if (!(groupSortedDesc[0].history_type === BacklogHistoryType.DELETE)) {
        for (let i = 1; i < groupSortedDesc.length; i += 1) {
          if (groupSortedDesc[i - 1].status !== groupSortedDesc[i].status) {
            if (groupSortedDesc[i - 1].status === 'Done' && groupSortedDesc[i].status !== 'Done') {
              // The last change is to Done
              const current = dailyCompletion.get(dayjs(groupSortedDesc[i - 1].date).format('DD/MM/YYYY')) ?? 0;
              dailyCompletion.set(dayjs(groupSortedDesc[i - 1].date).format('DD/MM/YYYY'), current + lastPoint);
              break;
            } else {
              // The last change is not to Done
              break;
            }
          }
        }
      }
    }

    return Array.from(dailyCompletion.entries()).map((e) => ({ date: e[0], value: e[1] }));
  }, [backlogHistory]);

  return data;
}
