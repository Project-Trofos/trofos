import { UserSession } from '@prisma/client';
import { BadRequestError } from './errorTypes';

export function assertStringIsNumberOrThrow(str: string | undefined, errorMessage: string) {
  if (Number.isNaN(Number(str))) {
    throw new BadRequestError(errorMessage);
  }
}

function getFieldUndefinedErrorMessage(fieldName: string) {
  return `Please provide a valid ${fieldName}! ${fieldName} cannot be undefined.`;
}

function getFieldNotNumberErrorMessage(fieldName: string) {
  return `Please provide a valid ${fieldName}! ${fieldName} must be a number.`;
}

export function assertCourseYearIsNumber(year: string | undefined): asserts year is string {
  assertStringIsNumberOrThrow(year, getFieldNotNumberErrorMessage('year'));
}

export function assertCourseSemIsNumber(sem: string | undefined): asserts sem is string {
  assertStringIsNumberOrThrow(sem, getFieldNotNumberErrorMessage('semester'));
}

export function assertCourseIdIsValid(courseId: string | undefined): asserts courseId is string {
  if (!courseId) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('courseId'));
  }
}

export function assertCourseNameIsValid(courseName: string | undefined): asserts courseName is string {
  if (!courseName) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('courseName'));
  }
}

export function assertUserIdIsValid(userId: string | undefined): asserts userId is string {
  if (!userId) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('userId'));
  }
}

export function assertProjectIdIsValid(projectId: string | undefined): asserts projectId is string {
  if (!projectId) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('projectId'));
  }
}

export function assertProjectNameIsValid(projectName: string | undefined): asserts projectName is string {
  if (!projectName) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('projectName'));
  }
}

export function assertInputIsNotEmpty(input: any, inputName: string) {
  if (!input) {
    throw new BadRequestError(getFieldUndefinedErrorMessage(inputName));
  }
}

export function assertUserSessionIsValid(userSession: UserSession | undefined): asserts userSession is UserSession {
  assertInputIsNotEmpty(userSession, 'userSession');
}
