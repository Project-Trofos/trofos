import { useMemo } from 'react';
import { Sprint } from '../../api/sprint';
import { Backlog } from '../../api/types';

// Group backlogs of sprints into types
// Assuming there is no backlog status `Backlog`
export default function useGroupSprintBacklog(sprints: Sprint[], unassignedBacklog: Backlog[]) {
  const data = useMemo(() => {
    const categories = new Map<string, number>();

    // Accumulate each category of backlog for sprints
    for (const sprint of sprints) {
      for (const item of sprint.backlogs) {
        categories.set(item.status, (categories.get(item.status) ?? 0) + 1);
      }
    }

    const categoriesList = Array.from(categories.entries()).map((entry) => {
      return {
        type: entry[0],
        value: entry[1],
      };
    });

    // Add in unassigned backlogs if applicable
    if (unassignedBacklog.length > 0) {
      return [...categoriesList, { type: 'Backlog', value: unassignedBacklog.length }];
    }
    return categoriesList;
  }, [sprints, unassignedBacklog]);

  return data;
}
