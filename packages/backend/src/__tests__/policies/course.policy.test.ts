import { UserSession } from '.prisma/client';
import { createRequest } from 'node-mocks-http';
import coursePolicy from '../../policies/course.policy'
import courseConstraint from '../../policies/constraints/course.constraint';
import { prismaMock } from '../../models/mock/mockPrismaClient';

const spies = {
    canManageCourse : jest.spyOn(courseConstraint, 'canManageCourse'),
}

describe("course.policy tests", () => {

    beforeEach(() => {
        jest.clearAllMocks()
    });

    describe("applyCoursePolicy", () => {
        it('should return a valid outcome if the user request has no parameters', async () => {
            const mockReq = createRequest();
            const userSessionObject = {
                user_id : 1
            } as UserSession
            const policyOutcome = await coursePolicy.applyCoursePolicy(mockReq, userSessionObject);
            expect(policyOutcome.isPolicyValid).toEqual(true);
            expect(policyOutcome.policyConstraint).not.toBeNull();
        })

        it('should return the policy outcome if the user request has the required parameters', async () => {
            spies.canManageCourse.mockResolvedValueOnce(true);
            const mockReq = createRequest();
            mockReq.params = {
                courseId : "TEST_ID",
                courseYear : "2022",
                courseSem : "1"
            }
            const userSessionObject = {
                user_id : 1
            } as UserSession
            const policyOutcome = await coursePolicy.applyCoursePolicy(mockReq, userSessionObject);
            expect(policyOutcome.isPolicyValid).toEqual(true);
            expect(policyOutcome.policyConstraint).not.toBeNull();
        })

    })
    describe("coursePolicyConstraint", () => {
        
    })
})