import dayjs from 'dayjs';
import { useMemo } from 'react';
import { BacklogHistory, BacklogHistoryType } from '../../api/types';

const DATE_FORMAT = 'YYYY-MM-DD';

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
              const current = dailyCompletion.get(dayjs(groupSortedDesc[i - 1].date).format(DATE_FORMAT)) ?? 0;
              dailyCompletion.set(dayjs(groupSortedDesc[i - 1].date).format(DATE_FORMAT), current + lastPoint);
              break;
            } else {
              // The last change is not to Done
              break;
            }
          }
        }
      }
    }

    const filledResult: { date: string; value: number }[] = [];

    Array.from(dailyCompletion.entries()).forEach((e) => {
      // Fill 0 entries between actual daily completion entries
      if (filledResult.length > 0) {
        const lastEntryDate = dayjs(filledResult[filledResult.length - 1].date);
        const dateDiff = dayjs(e[0]).diff(lastEntryDate, 'day');
        for (let i = 1; i < dateDiff; i += 1) {
          filledResult.push({
            date: lastEntryDate.add(i, 'day').format(DATE_FORMAT),
            value: 0,
          });
        }
      }
      filledResult.push({ date: e[0], value: e[1] });
    });

    return filledResult;
  }, [backlogHistory]);

  return data;
}
