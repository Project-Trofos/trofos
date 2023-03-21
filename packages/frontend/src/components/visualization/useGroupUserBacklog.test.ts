import { renderHook } from '@testing-library/react';
import { MSW_PROJECT, MSW_SPRINT } from '../../mocks/handlers';
import useGroupUserBacklog from './useGroupUserBacklog';

describe('test useGroupUserBacklog hook', () => {
  describe('when provided with valid data', () => {
    it('should return valid user groups', () => {
      const { user } = MSW_PROJECT.users[0];
      const sprint = MSW_SPRINT[1];
      const { result } = renderHook(() => useGroupUserBacklog([sprint], MSW_PROJECT.users));

      expect(result.current).toHaveLength(1);
      expect(result.current).toContainEqual({
        type: user.user_display_name,
        value: sprint.backlogs.filter((b) => b.assignee_id === user.user_id).reduce((n, b) => n + (b.points ?? 0), 0),
      });
    });
  });

  describe('when provided with empty sprint data', () => {
    it('should return empty array', () => {
      const sprint = MSW_SPRINT[0];
      const { result } = renderHook(() => useGroupUserBacklog([sprint], MSW_PROJECT.users));

      expect(result.current).toHaveLength(0);
    });
  });
});
