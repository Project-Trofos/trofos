import { useMemo } from 'react';
import { Sprint } from '../../api/sprint';
import { UserData } from '../../api/types';

// Group backlogs of sprints into the assignees
export default function useGroupUserBacklog(sprints: Sprint[], users: UserData[]) {
  const userIdToDisplayName = useMemo(() => {
    const map = new Map<number, string>();

    for (const user of users) {
      map.set(user.user.user_id, user.user.user_display_name);
    }
    return map;
  }, [users]);

  const data = useMemo(() => {
    const map = new Map<number, number>();

    // Accumulate backlog for sprints by each assignee
    for (const sprint of sprints) {
      for (const item of sprint.backlogs) {
        if (item.assignee_id !== null) {
          map.set(item.assignee_id, (map.get(item.assignee_id) ?? 0) + 1);
        }
      }
    }

    const list = Array.from(map.entries()).map((entry) => {
      return {
        type: userIdToDisplayName.get(entry[0]),
        value: entry[1],
      };
    });

    return list;
  }, [sprints, userIdToDisplayName]);

  return data;
}
