import { User } from "@prisma/client";
import { prismaMock } from "../../../models/mock/mockPrismaClient";
import userConstraint from "../../../policies/constraints/user.constraint";


describe("user.constraint tests", () => {
    describe("canManageUser", () => {
        it("should return true if the user is an admin", async () => {
            await expect(userConstraint.canManageUser(1, true)).resolves.toEqual(true);
        })

        it("should return true if the user is trying to manage their own account", async () => {
            const testUser = {} as User
            prismaMock.user.findMany.mockResolvedValueOnce([testUser]);
            await expect(userConstraint.canManageUser(1, false)).resolves.toEqual(true);
        })

        it("should return false if the user is trying to manage someone else's account", async () => {
            prismaMock.user.findMany.mockResolvedValueOnce([]);
            await expect(userConstraint.canManageUser(1, false)).resolves.toEqual(false);
        })
    });
})