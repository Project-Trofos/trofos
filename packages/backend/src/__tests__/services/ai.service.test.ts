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
  it('should keep valid values for a preset 1-4 week sprint', () => {
    expect(
      sanitizeSprintAutofill({ name: ' Sprint 1 ', weeks: 2, startDate: '2025-01-06', goals: ' Ship the MVP ' }),
    ).toEqual({
      name: 'Sprint 1',
      duration: 2,
      startDate: '2025-01-06',
      goals: 'Ship the MVP',
    });
  });

  it('should keep a preset duration even without a start date', () => {
    expect(sanitizeSprintAutofill({ weeks: 3 })).toEqual({ duration: 3 });
  });

  it('should leave nulls and missing values blank', () => {
    expect(
      sanitizeSprintAutofill({
        name: null,
        weeks: null,
        lengthInDays: null,
        startDate: null,
        endDate: null,
        goals: null,
      }),
    ).toEqual({});
    expect(sanitizeSprintAutofill({})).toEqual({});
  });

  it('should drop week counts that are zero, fractional or above 12', () => {
    expect(sanitizeSprintAutofill({ weeks: 0, startDate: '2026-10-05' })).toEqual({ startDate: '2026-10-05' });
    expect(sanitizeSprintAutofill({ weeks: 2.5, startDate: '2026-10-05' })).toEqual({ startDate: '2026-10-05' });
    expect(sanitizeSprintAutofill({ weeks: 13, startDate: '2026-10-05' })).toEqual({ startDate: '2026-10-05' });
  });

  it('should drop a start date that is not a real YYYY-MM-DD calendar date', () => {
    expect(sanitizeSprintAutofill({ startDate: 'not a date' })).toEqual({});
    expect(sanitizeSprintAutofill({ startDate: '2025-02-30' })).toEqual({});
    expect(sanitizeSprintAutofill({ startDate: '2025-01-06T00:00:00.000Z' })).toEqual({});
  });

  it('should drop non-numeric week counts that coerce to valid numbers', () => {
    expect(sanitizeSprintAutofill({ weeks: true })).toEqual({});
    expect(sanitizeSprintAutofill({ weeks: [2] })).toEqual({});
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

  describe('custom date ranges', () => {
    it('should use a named end date as a custom range', () => {
      expect(sanitizeSprintAutofill({ startDate: '2026-10-05', endDate: '2026-10-09' })).toEqual({
        duration: 0,
        startDate: '2026-10-05',
        endDate: '2026-10-09',
      });
    });

    it('should allow a one-day range', () => {
      expect(sanitizeSprintAutofill({ startDate: '2026-10-05', endDate: '2026-10-05' })).toEqual({
        duration: 0,
        startDate: '2026-10-05',
        endDate: '2026-10-05',
      });
    });

    it('should drop an end date before the start date', () => {
      expect(sanitizeSprintAutofill({ startDate: '2026-10-05', endDate: '2026-10-04' })).toEqual({
        startDate: '2026-10-05',
      });
    });

    it('should count the last day when the length is given in days', () => {
      expect(sanitizeSprintAutofill({ startDate: '2026-10-02', lengthInDays: 5 })).toEqual({
        duration: 0,
        startDate: '2026-10-02',
        endDate: '2026-10-06',
      });
    });

    it('should work across a year boundary', () => {
      expect(sanitizeSprintAutofill({ startDate: '2026-12-30', lengthInDays: 5 })).toEqual({
        duration: 0,
        startDate: '2026-12-30',
        endDate: '2027-01-03',
      });
    });

    it('should turn more than 4 weeks into a custom range of start + 7 x weeks', () => {
      expect(sanitizeSprintAutofill({ startDate: '2026-10-05', weeks: 6 })).toEqual({
        duration: 0,
        startDate: '2026-10-05',
        endDate: '2026-11-16',
      });
    });

    it('should calculate the end from a day count even if the model also returned an end date', () => {
      // The model sometimes works out its own end date from a length and gets it wrong
      expect(sanitizeSprintAutofill({ startDate: '2026-10-02', lengthInDays: 5, endDate: '2026-10-07' })).toEqual({
        duration: 0,
        startDate: '2026-10-02',
        endDate: '2026-10-06',
      });
    });

    it('should calculate the end from a week count even if the model also returned an end date', () => {
      expect(sanitizeSprintAutofill({ startDate: '2026-10-05', weeks: 6, endDate: '2026-11-15' })).toEqual({
        duration: 0,
        startDate: '2026-10-05',
        endDate: '2026-11-16',
      });
      expect(sanitizeSprintAutofill({ startDate: '2026-10-05', weeks: 2, endDate: '2026-10-16' })).toEqual({
        duration: 2,
        startDate: '2026-10-05',
      });
    });

    it('should drop range fields when there is no start date', () => {
      expect(sanitizeSprintAutofill({ endDate: '2026-10-09' })).toEqual({});
      expect(sanitizeSprintAutofill({ lengthInDays: 5 })).toEqual({});
      expect(sanitizeSprintAutofill({ weeks: 6 })).toEqual({});
    });

    it('should allow a 12-week sprint but drop anything longer, and out-of-range day counts', () => {
      expect(sanitizeSprintAutofill({ startDate: '2026-10-05', weeks: 12 })).toEqual({
        duration: 0,
        startDate: '2026-10-05',
        endDate: '2026-12-28',
      });
      expect(sanitizeSprintAutofill({ startDate: '2026-10-05', endDate: '2026-12-29' })).toEqual({
        startDate: '2026-10-05',
      });
      expect(sanitizeSprintAutofill({ startDate: '2026-10-05', lengthInDays: 85 })).toEqual({
        startDate: '2026-10-05',
      });
      expect(sanitizeSprintAutofill({ startDate: '2026-10-05', lengthInDays: 0 })).toEqual({
        startDate: '2026-10-05',
      });
    });
  });
});

describe('extractSprintDetails', () => {
  beforeEach(() => mockCreate.mockReset());

  it("should give the model today's date so relative dates resolve correctly", async () => {
    mockCreate.mockResolvedValue(mockCompletion('{"startDate":"2026-10-05","weeks":2}'));

    const result = await extractSprintDetails('2 weeks starting next Monday', '42', new Date(2026, 8, 30));

    const { messages, user } = mockCreate.mock.calls[0][0];
    expect(messages[0].content).toContain('2026-09-30');
    expect(user).toBe('42');
    expect(result).toEqual({ startDate: '2026-10-05', duration: 2 });
  });

  it('should give the model a weekday calendar so it looks dates up instead of calculating them', async () => {
    mockCreate.mockResolvedValue(mockCompletion('{}'));

    await extractSprintDetails('starting next Monday', '42', new Date(2026, 8, 30));

    const prompt: string = mockCreate.mock.calls[0][0].messages[0].content;
    expect(prompt).toContain('Wednesday, 2026-09-30');
    expect(prompt).toContain('Monday 2026-10-05');
    expect(prompt).toContain('Saturday 2026-10-03');
    // Covers four weeks ahead, across the month boundary
    expect(prompt).toContain('Wednesday 2026-10-28');
    expect(prompt).not.toContain('2026-10-29');
  });

  it('should ask for custom ranges and keep length and dates out of goals', async () => {
    mockCreate.mockResolvedValue(mockCompletion('{}'));

    await extractSprintDetails('Sprint 7 from next Monday to Friday', '42', new Date(2026, 8, 30));

    const prompt: string = mockCreate.mock.calls[0][0].messages[0].content;
    expect(prompt).toContain('"endDate"');
    expect(prompt).toContain('"lengthInDays"');
    expect(prompt).toContain('"weeks"');
    expect(prompt).toMatch(/never put the sprint's name, length or dates in goals/i);
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
