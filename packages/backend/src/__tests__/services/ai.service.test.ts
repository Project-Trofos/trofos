jest.mock('../../services/aiInsight.service', () => ({ redis: {} }));
jest.mock('../../models/prismaPgvectorClient', () => ({ __esModule: true, default: {} }));
jest.mock('openai');

import { sanitizeCourseAutofill, sanitizeSprintAutofill } from '../../services/ai.service';

describe('sanitizeCourseAutofill', () => {
  it('should keep valid values', () => {
    expect(
      sanitizeCourseAutofill({ courseName: ' Software Engineering ', courseCode: 'CS3203', courseYear: 2025, courseSem: 2 }),
    ).toEqual({ courseName: 'Software Engineering', courseCode: 'CS3203', courseYear: 2025, courseSem: 2 });
  });

  it('should leave nulls and missing values blank', () => {
    expect(sanitizeCourseAutofill({ courseName: null, courseCode: null, courseYear: null, courseSem: null })).toEqual({});
    expect(sanitizeCourseAutofill({})).toEqual({});
  });

  it('should drop a name that is non-alphanumeric or longer than 64 characters', () => {
    expect(sanitizeCourseAutofill({ courseName: 'Intro to C++!' })).toEqual({});
    expect(sanitizeCourseAutofill({ courseName: 'a'.repeat(65) })).toEqual({});
  });

  it('should drop a semester other than 1 or 2', () => {
    expect(sanitizeCourseAutofill({ courseSem: 3 })).toEqual({});
    expect(sanitizeCourseAutofill({ courseSem: 'summer' })).toEqual({});
  });

  it('should drop a non-integer or out of range year', () => {
    expect(sanitizeCourseAutofill({ courseYear: 2025.5 })).toEqual({});
    expect(sanitizeCourseAutofill({ courseYear: 25 })).toEqual({});
  });

  it('should handle non-object input', () => {
    expect(sanitizeCourseAutofill(null)).toEqual({});
    expect(sanitizeCourseAutofill('text')).toEqual({});
  });
});

describe('sanitizeSprintAutofill', () => {
  it('should keep valid values', () => {
    expect(
      sanitizeSprintAutofill({ name: ' Sprint 1 ', duration: 2, startDate: '2025-01-06', goals: ' Ship the MVP ' }),
    ).toEqual({
      name: 'Sprint 1',
      duration: 2,
      startDate: new Date('2025-01-06').toISOString(),
      goals: 'Ship the MVP',
    });
  });

  it('should leave nulls and missing values blank', () => {
    expect(sanitizeSprintAutofill({ name: null, duration: null, startDate: null, goals: null })).toEqual({});
    expect(sanitizeSprintAutofill({})).toEqual({});
  });

  it('should drop a duration outside 1-4, including the custom 0 duration', () => {
    expect(sanitizeSprintAutofill({ duration: 0 })).toEqual({});
    expect(sanitizeSprintAutofill({ duration: 5 })).toEqual({});
    expect(sanitizeSprintAutofill({ duration: 2.5 })).toEqual({});
  });

  it('should drop an unparseable start date', () => {
    expect(sanitizeSprintAutofill({ startDate: 'not a date' })).toEqual({});
  });

  it('should drop an empty or overlong name or goals', () => {
    expect(sanitizeSprintAutofill({ name: '   ' })).toEqual({});
    expect(sanitizeSprintAutofill({ name: 'a'.repeat(129) })).toEqual({});
    expect(sanitizeSprintAutofill({ goals: 'a'.repeat(2001) })).toEqual({});
  });

  it('should handle non-object input', () => {
    expect(sanitizeSprintAutofill(null)).toEqual({});
    expect(sanitizeSprintAutofill('text')).toEqual({});
  });
});
