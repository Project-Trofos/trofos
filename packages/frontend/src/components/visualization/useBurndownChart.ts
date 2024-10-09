import dayjs from 'dayjs';
import { useMemo } from 'react';
import { BacklogHistory, BacklogHistoryType, BacklogStatus } from '../../api/types';
import { Sprint } from '../../api/sprint';

export type StoryPointData = {
  date: Date;
  point: number;
  type: BacklogHistory['history_type'];
  message: string;
  backlog_id: number;
};

export function useBurndownChart(backlogHistory: BacklogHistory[], sprint? : Sprint) {
  const sprintId = sprint?.id;
  const sprintEndDate = sprint?.end_date;
  const sprintStartDate = sprint?.start_date;
  //TOOD: consider moving operations to backend where possible

  // Filter backlog history to only belong to a certain sprint
  // if no sprint specified, return all history
  // else, return only history that belongs to the sprint. also, if any backlog in this sprint is moved:
  //     case 1- moved to another sprint: treat as delete
  //     case 2- moved in from another sprint: treat as create
  const backlogFiltered = useMemo(() => {
    if (!sprintId) {
      return [...backlogHistory].sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1));
    } else {
      const backlogSorted = [...backlogHistory].sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1));

      // all backlogs that have appeared in this sprint should be kept
      const backlogIdsThatAppearedInThisSprint = new Set<number>();

      // map the backlogId to corresponding date of the case
      const backlogIdsNotCreatedInThisSprintMap = new Map<number, Date>();
      // key: a backlog id where the backlog has been moved out of sprint permanently. val: earliest date this happened
      const backlogIdsWhereLastHistoryNotInThisSprintMap = new Map<number, Date>();

      for (const backlog of backlogSorted) {
        if (backlog.sprint_id === sprintId) {
          // first history of this backlog for cur sprint isn't create -> case 2
          if (!backlogIdsThatAppearedInThisSprint.has(backlog.backlog_id) && backlog.history_type !== BacklogHistoryType.CREATE) {
            backlogIdsNotCreatedInThisSprintMap.set(backlog.backlog_id, new Date(backlog.date));
          }
          backlogIdsThatAppearedInThisSprint.add(backlog.backlog_id);
          // we found a backlog moved out of sprint then back into sprint -> still to be displayed in this sprint's burndown
          if (backlogIdsWhereLastHistoryNotInThisSprintMap.has(backlog.backlog_id)) {
            backlogIdsWhereLastHistoryNotInThisSprintMap.delete(backlog.backlog_id);
          }
        } else {
          // if backlog has been in current sprint before and now is in another spring -> check case 1
          // this will be removed if subsequently, this backlog re-appears in current sprint (moved out and back into cur sprint)
          if (backlogIdsThatAppearedInThisSprint.has(backlog.backlog_id) && !backlogIdsWhereLastHistoryNotInThisSprintMap.has(backlog.backlog_id)) {
            backlogIdsWhereLastHistoryNotInThisSprintMap.set(backlog.backlog_id, new Date(backlog.date));
          }
        }
      }

      // case 1 backlog ids = backlogIdsWhereLastHistoryNotInThisSprint
      // case 2 backlog ids = backlogIdsThatAppearedInThisSprint <set difference> backlogIdsCreatedInThisSprint
      const case1IdDateMap = backlogIdsWhereLastHistoryNotInThisSprintMap;
      const case2IdDateMap = backlogIdsNotCreatedInThisSprintMap;

      // filter to keep backlogs relevant to this sprint, keeping in mind case 1 and case 2
      // case 1- need to check what was last history entry that was in this sprint- subsequently filtered out
      // case 2- check first history that was in this sprint- all entries before that are filtered out
      const relevantBacklogs = backlogSorted.filter((b) => {
        if (!backlogIdsThatAppearedInThisSprint.has(b.backlog_id)) {
          return false;
        }
        if (case1IdDateMap.has(b.backlog_id) && case1IdDateMap.get(b.backlog_id)!! < new Date(b.date)) {
          return false;
        }
        if (case2IdDateMap.has(b.backlog_id) && case2IdDateMap.get(b.backlog_id)!! > new Date(b.date)) {
          return false;
        }
        return true;
      });
      
      return relevantBacklogs;
    }
  }, [backlogHistory, sprintId]);

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
        if (sprintId && (!prevBacklog || (prevBacklog.sprint_id !== sprintId && backlog.sprint_id === sprintId))) {
          // Moved in from another sprint and sprintId provided
          const delta = backlog.points ?? 0;
          currentPoint += delta;
          message = `Issue ${backlog.backlog_id} moved in. Story point +${delta}.`;
        } else if (!sprintId && (!prevBacklog)) { // at this point, prevBacklog = undefined is handled for both sprintId given/not given
          // Moved in from another sprint
          const delta = backlog.points ?? 0;
          currentPoint += delta;
          message = `Issue ${backlog.backlog_id} moved in. Story point +${delta}.`;
        } else if (prevBacklog!!.status === BacklogStatus.DONE) {
          // done => not done
          const delta = backlog.points ?? 0;
          currentPoint += delta;
          message = `Issue ${backlog.backlog_id} marked as not done. Story point +${delta}.`;
        }else if (sprintId && (prevBacklog!!.points !== backlog.points && backlog.sprint_id === sprintId)) {
          // Update story point value if it's in the same sprint
          const delta = (backlog.points ?? 0) - (prevBacklog!!.points ?? 0);
          currentPoint += delta;
          message = `Issue ${backlog.backlog_id} updated. Story point ${
            delta > 0 ? `+${delta}` : `-${Math.abs(delta)}`
          }.`;
        }  else if (!sprintId && (prevBacklog!!.points !== backlog.points)) {
          // Update story point value
          const delta = (backlog.points ?? 0) - (prevBacklog!!.points ?? 0);
          currentPoint += delta;
          message = `Issue ${backlog.backlog_id} updated. Story point ${
            delta > 0 ? `+${delta}` : `-${Math.abs(delta)}`
          }.`;
        } else if (sprintId && (backlog.sprint_id !== prevBacklog!!.sprint_id)) {
          //handle move issue out of sprint, treat as delete
          const delta = prevBacklog!!.points ?? 0;
          currentPoint -= delta;
          message = `Issue ${backlog.backlog_id} moved out of sprint. Story point -${Math.abs(delta)}.`;
        } else {
          message = `Issue ${backlog.backlog_id} updated from [${prevBacklog!!.status}] to [${backlog.status}]`;
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
        backlog.points !== prevBacklog?.points || 
        (sprintId && backlog.sprint_id !== prevBacklog?.sprint_id)
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

    // aggregate changes that happen within the same hour
    let aggregatedData = data.reduce((acc, cur) => {
      if (acc.length === 0) {
        acc.push(cur);
      } else {
        const last = acc[acc.length - 1];
        if (last.message !== 'Start' && dayjs(last.date).isSame(cur.date, 'hour')) {
          last.message += `\n${cur.message}`
          // if mulitple data points for that hour, just agg. to the 1 pt at x h 30 min
          last.date = new Date(last.date.setMinutes(30));
          last.point = cur.point;
        } else {
          acc.push(cur);
        }
      }
      return acc;
    }, [] as StoryPointData[]);

    // aggregate points before sprint start date if there is one (tickets moved into this sprint
    // from prev sprint)
    if (sprintStartDate) {
      aggregatedData = aggregatedData.reduce((acc, cur) => {
        if (dayjs(cur.date).isBefore(sprintStartDate)) {
          if (acc.length === 0) {
            acc.push(cur);
          } else {
            const last = acc[acc.length - 1];
            last.message += `\n${cur.message}`
            // if mulitple data points for that hour, just agg. to the 1 pt at x h 30 min
            last.date = new Date(sprintStartDate);
            last.point = cur.point;
          }
        } else {
          acc.push(cur);
        }
        return acc;
      }, [] as StoryPointData[]);
    }

    // Add a dummy end point if today is before end of sprint
    if (backlogFiltered.length > 0 && (!sprintEndDate || dayjs(sprintEndDate).isAfter(new Date()))) {
      // Have an artificial gap
      aggregatedData.push({
        date: new Date(),
        point: currentPoint,
        type: BacklogHistoryType.CREATE,
        message: 'Now',
        backlog_id: backlogFiltered[backlogFiltered.length - 1].backlog_id,
      });
    }

    return aggregatedData;
  }, [backlogGrouped, backlogFiltered, sprintEndDate]);

  return { storyPointData, backlogGrouped, backlogSorted: backlogFiltered };
}
