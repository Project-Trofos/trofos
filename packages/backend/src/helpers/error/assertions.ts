import { UserSession } from '@prisma/client';
import { OptionRequestBody } from '../../controllers/requestTypes';
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
  try {
    Number(courseId);
  } catch (e) {
    throw new BadRequestError('courseId should be a number!');
  }
}

export function assertCourseNameIsValid(courseName: string | undefined): asserts courseName is string {
  if (!courseName) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('courseName'));
  }
}

export function assertCourseCodeIsValid(courseCode: string | undefined): asserts courseCode is string {
  if (!courseCode) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('courseName'));
  }
  if (!courseCode.match('[a-zA-Z0-9]')) {
    throw new BadRequestError('Course code is not alphanumeric!');
  }
}

export function assertUserIdIsValid(userId: string | undefined): asserts userId is string {
  if (!userId) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('userId'));
  }
}

// Assert projectId is not undefined and it is a number
export function assertProjectIdIsValid(projectId: string | number | undefined): asserts projectId is string | number {
  if (!projectId) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('projectId'));
  }
  if (typeof projectId !== 'number') {
    assertStringIsNumberOrThrow(projectId, getFieldNotNumberErrorMessage('projectId'));
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

export function assertStatusNameIsValid(name: string | undefined): asserts name is string {
  if (!name) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('name'));
  }
}

export function assertStartAndEndIsValid(startYear: number, startSem: number, endYear: number, endSem: number) {
  if (startYear > endYear || (startYear === endYear && startSem > endSem)) {
    throw new BadRequestError('Course end date cannot be before start date!');
  }
}

export function assertGetAllOptionIsValid(option?: OptionRequestBody['option']) {
  if (option && !['all', 'past', 'current', 'future'].includes(option)) {
    throw new BadRequestError('Please provide a correct option. option can only be all, past, current, or future.');
  }
}

export function assertDateIsValid(date: string | undefined): asserts date is string {
  try {
    if (!date) {
      throw new Error();
    }
    const d = new Date(date);
    // If date is not a valid string,
    // `new` returns a Date object whose `toString()` method returns the literal string `Invalid Date`
    if (d.toString() === 'Invalid Date') {
      throw new Error();
    }
  } catch (e) {
    throw new BadRequestError('Please provide a valid date!');
  }
}

export function assertMilestoneIdIsValid(milestoneId: string | undefined): asserts milestoneId is string {
  if (!milestoneId) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('milestoneId'));
  }
}

export function assertMilestoneNameIsValid(milestoneName: string | undefined): asserts milestoneName is string {
  if (!milestoneName) {
    throw new BadRequestError(getFieldUndefinedErrorMessage('milestoneName'));
  }
}

// Asserts that dateA is dateA is before dateB or throw BadRequestError
export function assertDateIsBefore(dateA: Date, dateB: Date): void {
  if (dateA > dateB) {
    throw new BadRequestError(`Date Error: ${dateA.toISOString()} is not before ${dateB.toISOString()}!`);
  }
}

