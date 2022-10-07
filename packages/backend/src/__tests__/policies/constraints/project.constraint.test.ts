import { Project } from '@prisma/client';
import { prismaMock } from '../../../models/mock/mockPrismaClient';
import projectConstraint from '../../../policies/constraints/project.constraint';

describe("project.constraint tests", () => {
    describe("canManageProject", () => {
        it("should return true if the user is an admin", async () => {
            await expect(projectConstraint.canManageProject(1, 1, true)).resolves.toEqual(true);
        })

        it("should return true if the user is associated with the project", async () => {
            const testProject = {} as Project
            prismaMock.project.findMany.mockResolvedValueOnce([testProject]);
            await expect(projectConstraint.canManageProject(1, 1, false)).resolves.toEqual(true);
        })

        it("should return false if the user is not associated with the project", async () => {
            prismaMock.project.findMany.mockResolvedValueOnce([]);
            await expect(projectConstraint.canManageProject(1, 1, false)).resolves.toEqual(false);

        })
    })
})