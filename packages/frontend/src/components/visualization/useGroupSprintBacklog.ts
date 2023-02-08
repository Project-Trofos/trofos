import { useMemo } from 'react';
import { Sprint } from '../../api/sprint';
import { Backlog } from '../../api/types';

// Group backlogs of a sprint into types
// Assuming there is no backlog status `Unassigned`
export default function useGroupSprintBacklog(sprint: Sprint, unassignedBacklog: Backlog[]) {
  const data = useMemo(() => {
    const categories = new Map<string, number>();

    // Accumulate each category of backlog for this sprint
    for (const item of sprint.backlogs) {
      categories.set(item.status, (categories.get(item.status) ?? 0) + 1);
    }

    const categoriesList = Array.from(categories.entries()).map((entry) => {
      return {
        type: entry[0],
        value: entry[1],
      };
    });

    // Add in unassigned backlogs if applicable
    if (unassignedBacklog.length > 0) {
      return [...categoriesList, { type: 'Unassigned', value: unassignedBacklog.length }];
    }
    return categoriesList;
  }, [sprint, unassignedBacklog]);

  return data;
}
