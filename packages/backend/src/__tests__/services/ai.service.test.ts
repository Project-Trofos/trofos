jest.mock('../../services/aiInsight.service', () => ({ redis: {} }));
jest.mock('../../models/prismaPgvectorClient', () => ({ __esModule: true, default: {} }));
jest.mock('openai');

import OpenAI from 'openai';
import {
  AI_UNAVAILABLE_MESSAGE,
  extractCourseDetails,
  extractSprintDetails,
  sanitizeCourseAutofill,
  sanitizeSprintAutofill,
} from '../../services/ai.service';

const mockCreate = jest.fn();
(OpenAI as unknown as jest.Mock).mockImplementation(() => ({ chat: { completions: { create: mockCreate } } }));

const mockCompletion = (content: string | null) => ({ choices: [{ message: { content } }] });

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

  it('should drop non-numeric values that coerce to valid numbers', () => {
    expect(sanitizeCourseAutofill({ courseSem: true, courseYear: [2025] })).toEqual({});
  });

  it('should accept numeric strings', () => {
    expect(sanitizeCourseAutofill({ courseSem: '2', courseYear: '2025' })).toEqual({ courseSem: 2, courseYear: 2025 });
  });
});

describe('sanitizeSprintAutofill', () => {
  it('should keep valid values', () => {
    expect(
      sanitizeSprintAutofill({ name: ' Sprint 1 ', duration: 2, startDate: '2025-01-06', goals: ' Ship the MVP ' }),
    ).toEqual({
      name: 'Sprint 1',
      duration: 2,
      startDate: '2025-01-06',
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

  it('should drop a start date that is not a real YYYY-MM-DD calendar date', () => {
    expect(sanitizeSprintAutofill({ startDate: 'not a date' })).toEqual({});
    expect(sanitizeSprintAutofill({ startDate: '2025-02-30' })).toEqual({});
    expect(sanitizeSprintAutofill({ startDate: '2025-01-06T00:00:00.000Z' })).toEqual({});
  });

  it('should drop non-numeric durations that coerce to valid numbers', () => {
    expect(sanitizeSprintAutofill({ duration: true })).toEqual({});
    expect(sanitizeSprintAutofill({ duration: [2] })).toEqual({});
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

describe('extractSprintDetails', () => {
  beforeEach(() => mockCreate.mockReset());

  it("should give the model today's date so relative dates resolve correctly", async () => {
    mockCreate.mockResolvedValue(mockCompletion('{"startDate":"2026-10-05","duration":2}'));

    const result = await extractSprintDetails('2 weeks starting next Monday', '42', new Date(2026, 8, 30));

    const { messages, user } = mockCreate.mock.calls[0][0];
    expect(messages[0].content).toContain('2026-09-30');
    expect(user).toBe('42');
    expect(result).toEqual({ startDate: '2026-10-05', duration: 2 });
  });

  it('should throw a generic error when the AI call fails', async () => {
    mockCreate.mockRejectedValue(new Error('401 Incorrect API key provided: sk-...'));
    await expect(extractSprintDetails('text', '42')).rejects.toThrow(AI_UNAVAILABLE_MESSAGE);
  });

  it('should throw a generic error when the AI returns malformed JSON', async () => {
    mockCreate.mockResolvedValue(mockCompletion('not json'));
    await expect(extractSprintDetails('text', '42')).rejects.toThrow(AI_UNAVAILABLE_MESSAGE);
  });

  it('should throw a generic error when the AI returns no content', async () => {
    mockCreate.mockResolvedValue(mockCompletion(null));
    await expect(extractSprintDetails('text', '42')).rejects.toThrow(AI_UNAVAILABLE_MESSAGE);
  });
});

describe('extractCourseDetails', () => {
  beforeEach(() => mockCreate.mockReset());

  it('should return sanitized course details', async () => {
    mockCreate.mockResolvedValue(mockCompletion('{"courseName":"Software Engineering","courseSem":3}'));
    await expect(extractCourseDetails('text', '42')).resolves.toEqual({ courseName: 'Software Engineering' });
  });

  it('should throw a generic error when the AI call fails', async () => {
    mockCreate.mockRejectedValue(new Error('upstream failure'));
    await expect(extractCourseDetails('text', '42')).rejects.toThrow(AI_UNAVAILABLE_MESSAGE);
  });
});
