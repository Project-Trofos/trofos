
import { Course } from '.prisma/client';
import { prismaMock } from '../../../models/mock/mockPrismaClient';
import courseConstraint from '../../../policies/constraints/course.constraint';

describe("course.constraint tests", () => {
    describe("canManageCouse", () => {
        it("should return true if the user is an admin", async () => {
            await expect(courseConstraint.canManageCourse(1, "TEST_ID", 1, 1, true)).resolves.toEqual(true);
        })

        it("should return true if the user is associated with the course", async () => {
            const testCourse = {} as Course
            prismaMock.course.findMany.mockResolvedValueOnce([testCourse]);
            await expect(courseConstraint.canManageCourse(1, "TEST_ID", 1, 1, false)).resolves.toEqual(true);
        })

        it("should return false if the user is not associated with the course", async () => {
            prismaMock.course.findMany.mockResolvedValueOnce([]);
            await expect(courseConstraint.canManageCourse(1, "TEST_ID", 1, 1, false)).resolves.toEqual(false);

        })
    })
})