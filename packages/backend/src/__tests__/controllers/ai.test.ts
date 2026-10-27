jest.mock('../../services/ai.service', () => ({
  extractCourseDetails: jest.fn(),
  extractSprintDetails: jest.fn(),
  processUserGuideQuery: jest.fn(),
}));
jest.mock('../../services/recommender.service', () => ({ __esModule: true, default: {} }));

import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import aiController from '../../controllers/ai';
import { extractCourseDetails, extractSprintDetails } from '../../services/ai.service';

const mockExtractSprint = extractSprintDetails as jest.Mock;
const mockExtractCourse = extractCourseDetails as jest.Mock;

const createResponseWithSession = () =>
  createResponse({ locals: { userSession: { user_id: 42, user_email: 'someone@example.com' } } });

describe('ai controller autofill', () => {
  beforeEach(() => {
    mockExtractSprint.mockReset();
    mockExtractCourse.mockReset();
  });

  it.each([
    ['autofillSprint', mockExtractSprint],
    ['autofillCourse', mockExtractCourse],
  ] as const)('%s sends the user id, not the email, to the AI service', async (handler, mockExtract) => {
    mockExtract.mockResolvedValue({ name: 'Sprint 1' });
    const req = createRequest({ body: { text: 'Sprint 1' } });
    const res = createResponseWithSession();

    await aiController[handler](req, res);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(mockExtract).toHaveBeenCalledWith('Sprint 1', '42');
  });

  it.each(['autofillSprint', 'autofillCourse'] as const)('%s rejects empty or overlong text', async (handler) => {
    for (const text of ['   ', 'a'.repeat(5001), 123]) {
      const res = createResponseWithSession();
      await aiController[handler](createRequest({ body: { text } }), res);
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    }
    expect(mockExtractSprint).not.toHaveBeenCalled();
    expect(mockExtractCourse).not.toHaveBeenCalled();
  });
});
