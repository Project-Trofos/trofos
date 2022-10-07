import { createRequest } from 'node-mocks-http';
import { UserSession } from "@prisma/client";
import policyEngine from "../../policies/policyEngine"

describe("policyEngine tests", () => {
    describe("execute", () => {
        it('should throw an error if there is no such policy name', async () => {
            const mockReq = createRequest();
            const userSessionObject = {} as UserSession
            await expect(policyEngine.execute(mockReq, userSessionObject, "UNKNOWN_POLICY")).rejects.toThrow("commandMap[policyName] is not a function")
        })
    })
})