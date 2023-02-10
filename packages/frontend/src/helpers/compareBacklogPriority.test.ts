import compareBacklogPriority from './compareBacklogPriority';

describe('test compareBacklogPriority', () => {
  describe('when there are no null in priority', () => {
    it('should compare correctly', () => {
      expect(compareBacklogPriority('very_low', 'very_high')).toBeLessThan(0);
      expect(compareBacklogPriority('low', 'high')).toBeLessThan(0);
      expect(compareBacklogPriority('low', 'medium')).toBeLessThan(0);
      expect(compareBacklogPriority('high', 'medium')).toBeGreaterThan(0);
      expect(compareBacklogPriority('medium', 'medium')).toBe(0);
    });
  });

  describe('when there are null in priority', () => {
    it('should compare correctly', () => {
      expect(compareBacklogPriority('very_low', null)).toBeGreaterThan(0);
      expect(compareBacklogPriority(null, 'high')).toBeLessThan(0);
      expect(compareBacklogPriority(null, null)).toBe(0);
    });
  });
});
