jest.mock('../../services/aiInsight.service', () => ({ redis: {} }));
jest.mock('../../models/prismaPgvectorClient', () => ({ __esModule: true, default: {} }));
jest.mock('openai');

import { sanitizeCourseAutofill } from '../../services/ai.service';

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
