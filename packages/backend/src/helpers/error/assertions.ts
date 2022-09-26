import { BadRequestError } from './errorTypes';

export function assertStringIsNumberOrThrow(str: string | undefined, errorMessage: string) {
  if (Number.isNaN(Number(str))) {
    throw new BadRequestError(errorMessage);
  }
}

export function assertCourseYearIsNumber(year: string | undefined) {
  assertStringIsNumberOrThrow(year, `Please provide a valid year! Provided ${year}`);
}

export function assertCourseSemIsNumber(sem: string | undefined) {
  assertStringIsNumberOrThrow(sem, `Please provide a valid semester! Provided ${sem}`);
}

export function assertCourseIdIsValid(courseId: string | undefined) {
  if (!courseId) {
    throw new BadRequestError('Please provide correct course id!');
  }
}

export function assertCourseNameIsValid(courseName: string | undefined): asserts courseName is string {
  if (!courseName) {
    throw new BadRequestError('Please provide correct course name!');
  }
}

export function assertUserIdIsValid(username: string | undefined): asserts username is string {
  if (!username) {
    throw new BadRequestError('Please provide correct username!');
  }
}

export function assertProjectIdIsValid(projectId: string | undefined): asserts projectId is string {
  if (!projectId) {
    throw new BadRequestError('Please provide correct project id!');
  }
}
