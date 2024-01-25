import { useMemo } from 'react';
import { Sprint } from '../../../api/sprint';
import { BacklogHistory } from '../../../api/types';

export function useBurnUp(backlogHistory: BacklogHistory[], sprint: Sprint) {
  const storyPointData = useMemo(() => {}, [backlogHistory, sprint]);
  return { storyPointData };
}
