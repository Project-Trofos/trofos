import dayjs from 'dayjs';
import { useMemo } from 'react';
import { BacklogHistory, BacklogHistoryType, BacklogStatus } from '../../api/types';

export type StoryPointData = {
  date: Date;
  point: number;
  type: BacklogHistory['history_type'];
  message: string;
  backlog_id: number;
};

export function useBurndownChart(
  backlogHistory: BacklogHistory[],
  sprintId: number | undefined,
  sprintEndDate?: string,
) {
  // When a backlog is moved to another sprint, add a dummy delete history
  const backlogHistoryAddMove = useMemo(() => {
    const backlogSorted = [...backlogHistory].sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1));

    const groups: { [key: number]: BacklogHistory[] } = {};
    for (const backlog of backlogSorted) {
      if (groups[backlog.backlog_id] === undefined) {
        groups[backlog.backlog_id] = [];
      }
      groups[backlog.backlog_id].push(backlog);
    }

    const newHistory = backlogSorted;

    for (const [id, group] of Object.entries(groups)) {
      for (let i = 1; i < group.length; i += 1) {
        if (group[i - 1].sprint_id !== group[i].sprint_id) {
          // A backlog has been moved to another sprint
          newHistory.push({ ...group[i], sprint_id: group[i - 1].sprint_id, history_type: BacklogHistoryType.DELETE });
        }
      }
    }

    return newHistory;
  }, [backlogHistory]);

  // Filter backlog history to only belong to a certain sprint
  const backlogFiltered = useMemo(
    () => backlogHistoryAddMove.filter((b) => b.sprint_id === sprintId),
    [backlogHistoryAddMove, sprintId],
  );

  // Group backlog history by backlog id
  const backlogGrouped = useMemo(() => {
    const group: { [key: number]: BacklogHistory[] } = {};
    for (const backlog of backlogFiltered) {
      if (group[backlog.backlog_id] === undefined) {
        group[backlog.backlog_id] = [];
      }
      group[backlog.backlog_id].push(backlog);
    }

    return group;
  }, [backlogFiltered]);

  // Find the chronological story point plot points
  const storyPointData = useMemo(() => {
    // Track the current index of each unique backlog
    const backlogIndices: { [key: number]: number } = {};
    for (const backlogId of Object.keys(backlogGrouped)) {
      backlogIndices[Number(backlogId)] = -1;
    }

    // Date to number of story points
    const data: StoryPointData[] = [];
    let currentPoint = 0;

    // Add a dummy start point
    if (backlogFiltered.length > 0) {
      // Have an artificial gap
      const oneMinuteBefore = new Date(backlogFiltered[0].date);
      oneMinuteBefore.setMinutes(oneMinuteBefore.getMinutes() - 1);
      data.push({
        date: oneMinuteBefore,
        point: 0,
        type: BacklogHistoryType.CREATE,
        message: 'Start',
        backlog_id: backlogFiltered[0].backlog_id,
      });
    }

    for (const backlog of backlogFiltered) {
      const prevIndex = backlogIndices[backlog.backlog_id];
      const prevBacklog = prevIndex === -1 ? undefined : backlogGrouped[backlog.backlog_id][prevIndex];
      let message = '';

      if (backlog.history_type === BacklogHistoryType.CREATE && backlog.status !== BacklogStatus.DONE) {
        // backlog created
        const delta = backlog.points ?? 0;
        currentPoint += delta;
        message = `Issue ${backlog.backlog_id} created. Story point +${delta}.`;
      } else if (backlog.history_type === BacklogHistoryType.UPDATE && backlog.status !== BacklogStatus.DONE) {
        if (!prevBacklog) {
          // Moved in from another sprint
          const delta = backlog.points ?? 0;
          currentPoint += delta;
          message = `Issue ${backlog.backlog_id} moved in. Story point +${delta}.`;
        } else if (prevBacklog.status === BacklogStatus.DONE) {
          // done => not done
          const delta = backlog.points ?? 0;
          currentPoint += delta;
          message = `Issue ${backlog.backlog_id} marked as not done. Story point +${delta}.`;
        } else if (prevBacklog.points !== backlog.points) {
          // Update story point value
          const delta = (backlog.points ?? 0) - (prevBacklog.points ?? 0);
          currentPoint += delta;
          message = `Issue ${backlog.backlog_id} updated. Story point ${
            delta > 0 ? `+${delta}` : `-${Math.abs(delta)}`
          }.`;
        } else {
          message = `Issue ${backlog.backlog_id} updated from [${prevBacklog.status}] to [${backlog.status}]`;
        }
      } else if (backlog.history_type === BacklogHistoryType.UPDATE && backlog.status === BacklogStatus.DONE) {
        if (!prevBacklog) {
          // Moved in from another sprint
          message = `Issue ${backlog.backlog_id} moved in. Story point +0.`;
        } else if (prevBacklog.status !== BacklogStatus.DONE) {
          // not done => done
          const delta = backlog.points ?? 0;
          currentPoint -= delta;
          message = `Issue ${backlog.backlog_id} marked as done. Story point -${Math.abs(delta)}.`;
        }
      } else if (backlog.history_type === BacklogHistoryType.DELETE) {
        // backlog deleted
        currentPoint -= backlog.points ?? 0;
        message = `Issue ${backlog.backlog_id} marked deleted.`;
      }

      // Update index
      backlogIndices[backlog.backlog_id] += 1;

      // Push date to result array only if there is meaningful change in story points
      // This prevents too many meaningless data points due to trivial change
      // such as change in backlog name
      if (
        backlog.history_type !== BacklogHistoryType.UPDATE ||
        backlog.status !== prevBacklog?.status ||
        backlog.points !== prevBacklog?.points
      ) {
        data.push({
          date: new Date(backlog.date),
          point: currentPoint,
          type: backlog.history_type,
          message,
          backlog_id: backlog.backlog_id,
        });
      }
    }

    // Add a dummy end point if today is before end of sprint
    if (backlogFiltered.length > 0 && (!sprintEndDate || dayjs(sprintEndDate).isAfter(new Date()))) {
      // Have an artificial gap
      data.push({
        date: new Date(),
        point: currentPoint,
        type: BacklogHistoryType.CREATE,
        message: 'Now',
        backlog_id: backlogFiltered[backlogFiltered.length - 1].backlog_id,
      });
    }

    return data;
  }, [backlogGrouped, backlogFiltered, sprintEndDate]);

  return { storyPointData, backlogGrouped, backlogSorted: backlogFiltered };
}
