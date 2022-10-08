import { Prisma } from '@prisma/client'
import bcrypt from "bcrypt"
import { prismaMock } from "../../models/mock/mockPrismaClient"
import accountService from "../../services/account.service"

const PRISMA_RECORD_NOT_FOUND = 'P2025';

describe("account.service tests", () => {
    describe("changePassword", () => {
        it("should successfuly change the user's password if a valid userId is supplied", async () => {
            const hashedPassword = bcrypt.hashSync("newUserPassword", 10)
            const mockUserData = {
                user_email: "testEmail@test.com",
                user_id: 1,
                user_password_hash: hashedPassword
            }
            prismaMock.user.update.mockResolvedValueOnce(mockUserData)
            await expect(accountService.changePassword(1, "newUserPassword")).resolves.toEqual(mockUserData)
        })

        it("should throw an error if an invalid userId is supplied", async () => {
            const prismaError = new Prisma.PrismaClientKnownRequestError('Record does not exist', PRISMA_RECORD_NOT_FOUND, 'testVersion');
            prismaMock.user.update.mockRejectedValueOnce(prismaError);
            await expect(accountService.changePassword(1, "newUserPassword")).rejects.toThrow(prismaError)
        })
    })
})