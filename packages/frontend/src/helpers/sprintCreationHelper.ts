import dayjs, { Dayjs } from "dayjs";
import { AutoSprintTypes } from "./SprintModal.types";
import { Sprint } from "../api/sprint";

export const GENERIC_NEW_SPRINT: AutoSprintTypes = {
  name: 'Sprint 1',
  dates: [dayjs(), dayjs().add(7, 'day')],
  duration: 1,
};

const incrementSprintName = (latestSprintName: string): string => {
  // Get last digit of the name
  const nameTokens: string[] = latestSprintName.split(' ');
  let sprintCount: number = +nameTokens[nameTokens.length - 1];
  if (isNaN(sprintCount)) {
    sprintCount = 2;
  } else {
    // Remove current count from the name if it exists
    nameTokens.pop();
  }
  // Concat latest count to the name
  return `${nameTokens.join(' ')} ${sprintCount + 1}`;
};

const incrementSprintDate = (duration: number, dates: string[]): Dayjs[] | undefined => {
  if (!dates[0] || !dates[1]) {
    return undefined;
  }
  if (duration === 0) {
    const startDate = dayjs(dates[0]);
    const endDate = dayjs(dates[1]);
    const currentRange = endDate.diff(startDate, 'day');
    return [endDate, endDate.add(currentRange, 'day')];
  }
  return [dayjs(dates[1]), dayjs(dates[1]).add(duration * 7, 'day')];
};

export const autoSuggestNewSprint = (latestSprint: Sprint): AutoSprintTypes => {
  // Only works if sprint follows a naming convention with a digit at the back (e.g Sprint 1 or Week 1)
  const newSprintName = incrementSprintName(latestSprint.name);
  const newDates = incrementSprintDate(latestSprint.duration, [latestSprint.start_date, latestSprint.end_date]);
  return {
    name: newSprintName,
    dates: newDates,
    duration: latestSprint.duration,
  };
};