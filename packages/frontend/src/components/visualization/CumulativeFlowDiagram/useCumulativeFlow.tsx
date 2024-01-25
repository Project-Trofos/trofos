import { useMemo, useState } from 'react';
import { BacklogHistory, BacklogHistoryType } from '../../../api/types';
import { Area } from '@ant-design/plots';
import { dateFormatter } from '../../../util/Formatters';
import { Dayjs } from 'dayjs';
import { useAppSelector } from '../../../app/hooks';

declare type CumulativeFlowData = {
  type: string;
  date: Date;
  value: number;
};

declare type EventValue<DateType> = DateType | null;
declare type RangeValue<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;

const filterDeletionEvents = (backlogHistories: BacklogHistory[]): BacklogHistory[] => {
  const deletedSet = new Set<number>();
  for (const backlogHistory of backlogHistories) {
    if (backlogHistory.history_type == BacklogHistoryType.DELETE) {
      deletedSet.add(backlogHistory.backlog_id);
    }
  }
  return backlogHistories.filter((b) => !deletedSet.has(b.backlog_id));
};

const initialiseStatusCounter = (backlogHistory: BacklogHistory[]): Map<string, number> => {
  const statusCounter = new Map<string, number>();
  for (const backlog of backlogHistory) {
    if (!statusCounter.has(backlog.status)) {
      statusCounter.set(backlog.status, 0);
    }
  }
  return statusCounter;
};

const registerCreateEvent = (
  counter: Map<string, number>,
  state: Map<number, string>,
  event: BacklogHistory,
): CumulativeFlowData[] => {
  counter.set(event.status, counter.get(event.status)! + 1);
  state.set(event.backlog_id, event.status);
  return Array.from(counter, ([type, value]) => ({ type: type, date: new Date(event.date), value: value }));
};

const registerUpdateEvent = (
  counter: Map<string, number>,
  state: Map<number, string>,
  event: BacklogHistory,
  initialStatus: string,
): CumulativeFlowData[] => {
  const prevStatus = state.get(event.backlog_id);
  const newStatus = event.status;

  if (prevStatus == newStatus) {
    return [];
  }

  if (prevStatus !== undefined && prevStatus != initialStatus) {
    counter.set(prevStatus, counter.get(prevStatus)! - 1);
  }
  if (newStatus != initialStatus) {
    counter.set(newStatus, counter.get(newStatus)! + 1);
  }
  state.set(event.backlog_id, event.status);
  return Array.from(counter, ([type, value]) => ({ type: type, date: new Date(event.date), value: value }));
};

export function useCummulativeFlowData(backlogHistory: BacklogHistory[]): CumulativeFlowData[] {
  const data = useMemo(() => {
    if (!backlogHistory || backlogHistory.length == 0) {
      return [];
    }
    const cummulativeFlowData: CumulativeFlowData[] = [];
    const history = filterDeletionEvents(backlogHistory).sort((a, b) => {
      // Sort in ascending order.
      return Date.parse(a.date) - Date.parse(b.date);
    });
    if (!history || backlogHistory.length == 0) {
      return [];
    }
    const statusCounter = initialiseStatusCounter(backlogHistory);
    const stateMap = new Map<number, string>(); // Keeps track of the status of each backlog
    const initialStatus = history[0].status; // ASSUMPTION: FIRST STATUS IN HISTORY MUST HAVE THE CORRECT INITIAL STATUS

    // For every task:
    // Ignore if deleted;
    // +1 to TODO the moment it is created (only creation events affect todos);
    // For statuses OTHER than the initial status:
    // +1 to STATUS for any OTHER_STATUS -> STATUS;
    // -1 to STATUS for any STATUS -> OTHER_STATUS;
    for (const event of history) {
      if (event.history_type === BacklogHistoryType.CREATE) {
        cummulativeFlowData.push(...registerCreateEvent(statusCounter, stateMap, event));
      } else if (event.history_type === BacklogHistoryType.UPDATE) {
        cummulativeFlowData.push(...registerUpdateEvent(statusCounter, stateMap, event, initialStatus));
      }
    }
    return cummulativeFlowData;
  }, [backlogHistory]);

  return data;
}

export function useCummulativeFlowConfig(data: CumulativeFlowData[]) {
  const isDarkTheme = useAppSelector((state) => state.themeSlice.isDarkTheme);
  const [dateRange, setDateRange] = useState<RangeValue<Dayjs>>(null);
  const config = useMemo(() => {
    return {
      data: data,
      theme: isDarkTheme ? 'dark' : 'default',
      xField: 'date',
      yField: 'value',
      seriesField: 'type',
      meta: {
        date: {
          alias: 'Date',
          type: 'time', // important to use this specific type.
          min: dateRange ? dateRange[0] : undefined,
          max: dateRange ? dateRange[1] : undefined,
        },
        value: {
          alias: 'Number of Issues',
        },
      },
    };
  }, [data, dateRange, isDarkTheme]);
  return { config, setDateRange };
}
