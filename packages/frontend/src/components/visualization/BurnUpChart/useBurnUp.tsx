import { useMemo } from 'react';
import { Sprint } from '../../../api/sprint';
import { BacklogHistory, BacklogHistoryType } from '../../../api/types';
import { filterDeletionEvents } from '../CumulativeFlowDiagram/useCumulativeFlow';

enum BurnUpType {
  WORK_SCOPE = 'Work Scope',
  COMPLETED_WORK = 'Completed Work',
}

declare type BurnUpData = {
  type: string;
  date: Date;
  value: number;
};

export function useBurnUp(backlogHistory: BacklogHistory[], sprint: Sprint) {
  const storyPointData = useMemo(() => {
    if (!backlogHistory || backlogHistory.length == 0) {
      return [];
    }
    const data: BurnUpData[] = [];
    const history = filterDeletionEvents(backlogHistory).sort((a, b) => {
      // Sort in ascending order.
      return Date.parse(a.date) - Date.parse(b.date);
    });
    if (!history || history.length == 0) {
      return [];
    }
    const statusCounter = new Map<string, number>();
    statusCounter.set('Work Scope', 0);
    statusCounter.set('Completed Work', 0);
    const stateMap = new Map<number, string>(); // Keeps track of the status of each backlog

    for (const event of history) {
      if (event.history_type === BacklogHistoryType.CREATE) {
        data.push(registerCreateEvent(statusCounter, stateMap, event));
      } else if (event.history_type === BacklogHistoryType.UPDATE) {
        data.push(registerUpdateEvent(statusCounter, stateMap, event));
      }
    }
    return data;
  }, [backlogHistory]);

  return { storyPointData };
}

function registerCreateEvent(statusCounter: Map<string, number>, stateMap: Map<number, string>, event: BacklogHistory) {
  statusCounter.set(BurnUpType.WORK_SCOPE, statusCounter.get(BurnUpType.WORK_SCOPE)! + 1);
  return { type: BurnUpType.WORK_SCOPE, value: statusCounter.get(BurnUpType.WORK_SCOPE)!, date: new Date(event.date) };
}

function registerUpdateEvent(statusCounter: Map<string, number>, stateMap: Map<number, string>, event: BacklogHistory) {
  statusCounter.set(BurnUpType.WORK_SCOPE, statusCounter.get(BurnUpType.WORK_SCOPE)! + 1);
  return {
    type: BurnUpType.COMPLETED_WORK,
    value: statusCounter.get(BurnUpType.WORK_SCOPE)!,
    date: new Date(event.date),
  };
}
