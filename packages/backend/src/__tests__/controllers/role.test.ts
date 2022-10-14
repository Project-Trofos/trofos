import { createRequest, createResponse } from "node-mocks-http";
import StatusCodes from "http-status-codes";
import { Action, ActionsOnRoles } from "@prisma/client";
import roleService from "../../services/role.service";
import role from "../../controllers/role";

const spies = {
    roleServiceGetAllActions : jest.spyOn(roleService, 'getAllActions'),
    roleServiceGetRoleActions : jest.spyOn(roleService, 'getRoleActions'),
    roleServiceAddActionToRole : jest.spyOn(roleService, 'addActionToRole'),
    roleServiceRemoveActionFromRole : jest.spyOn(roleService, 'removeActionFromRole')
}

describe("role.controller tests", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getAllActions", () => {
        it("should return all actions in the application if the query was successful", async () => {
            const roleServiceResponseObject = ['testActionOne', 'testActionTwo'];
            const mockReq = createRequest();
            const mockRes = createResponse();
            spies.roleServiceGetAllActions.mockReturnValueOnce(roleServiceResponseObject);
            await role.getAllActions(mockReq, mockRes);
            const jsonData = mockRes._getJSONData();
            expect(jsonData).toEqual(roleServiceResponseObject)
            expect(mockRes.statusCode).toEqual(StatusCodes.OK);
        })

        it("should return status 500 INTERNAL SEVER ERROR if the query was unsuccessful", async () => {
            const mockReq = createRequest();
            const mockRes = createResponse();
            spies.roleServiceGetAllActions.mockImplementationOnce(() => { throw new Error("Error during request") });
            await role.getAllActions(mockReq, mockRes);
            expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(mockRes._getJSONData()).toEqual({ error : "Error during request"});
        })
    })

    describe("getRoleActions", () => {
        it("should return status 500 INTERNAL SEVER ERROR if the query was unsuccessful", async () => {
            const roleServiceResponseError = new Error("Error during request");
            const mockReq = createRequest();
            const mockRes = createResponse();
            spies.roleServiceGetRoleActions.mockRejectedValueOnce(roleServiceResponseError);
            await role.getRoleActions(mockReq, mockRes);
            expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(mockRes._getJSONData()).toEqual({ error : "Error during request"});
        })

        it("should return all roles and their actions in the application if the query was successful", async () => {
            const roleServiceResponseObject = [{
                id : 1,
                role_name : "testRole",
                actions : []
            }];
            const mockReq = createRequest();
            const mockRes = createResponse();
            spies.roleServiceGetRoleActions.mockResolvedValueOnce(roleServiceResponseObject);
            await role.getRoleActions(mockReq, mockRes);
            const jsonData = mockRes._getJSONData();
            expect(jsonData).toEqual(roleServiceResponseObject)
            expect(mockRes.statusCode).toEqual(StatusCodes.OK);
        })
    })

    describe("addActionToRole", () => {
        it("should return status 400 BAD REQUEST if the role id was not supplied", async () => {
            const mockReq = createRequest();
            const mockRes = createResponse();
            mockReq.body = {
                action : 'test_action'
            }
            await role.addActionToRole(mockReq, mockRes);
            expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockRes._getJSONData()).toEqual({ error : "Role id must be a number"});
        })

        it("should return status 400 BAD REQUEST if the action was not supplied", async () => {
            const mockReq = createRequest();
            const mockRes = createResponse();
            mockReq.body = {
                roleId : 1
            }
            await role.addActionToRole(mockReq, mockRes);
            expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockRes._getJSONData()).toEqual({ error : "Please provide a valid Role action! Role action cannot be undefined."});
        })

        it("should return all roles and their actions in the application if the query was successful", async () => {
            const roleServiceResponseObject : ActionsOnRoles = {
                role_id : 1,
                action : Action.admin
            };
            const mockReq = createRequest();
            const mockRes = createResponse();
            mockReq.body = {
                roleId : 1,
                action : Action.admin
            }
            spies.roleServiceAddActionToRole.mockResolvedValueOnce(roleServiceResponseObject);
            await role.addActionToRole(mockReq, mockRes);
            const jsonData = mockRes._getJSONData();
            expect(jsonData.message).toEqual("Successfully added")
            expect(jsonData.data).toEqual(roleServiceResponseObject);
            expect(mockRes.statusCode).toEqual(StatusCodes.OK);
        })
    })

    describe("removeActionFromRole", () => {
        it("should return status 400 BAD REQUEST if the role id was not supplied", async () => {
            const mockReq = createRequest();
            const mockRes = createResponse();
            mockReq.body = {
                action : 'test_action'
            }
            await role.removeActionFromRole(mockReq, mockRes);
            expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockRes._getJSONData()).toEqual({ error : "Role id must be a number"});
        })

        it("should return status 400 BAD REQUEST if the action was not supplied", async () => {
            const mockReq = createRequest();
            const mockRes = createResponse();
            mockReq.body = {
                roleId : 1
            }
            await role.removeActionFromRole(mockReq, mockRes);
            expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockRes._getJSONData()).toEqual({ error : "Please provide a valid Role action! Role action cannot be undefined."});
        })

        it("should return all roles and their actions in the application if the query was successful", async () => {
            const roleServiceResponseObject : ActionsOnRoles = {
                role_id : 1,
                action : Action.admin
            };
            const mockReq = createRequest();
            const mockRes = createResponse();
            mockReq.body = {
                roleId : 1,
                action : Action.admin
            }
            spies.roleServiceRemoveActionFromRole.mockResolvedValueOnce(roleServiceResponseObject);
            await role.removeActionFromRole(mockReq, mockRes);
            const jsonData = mockRes._getJSONData();
            expect(jsonData.message).toEqual("Successfully removed")
            expect(jsonData.data).toEqual(roleServiceResponseObject);
            expect(mockRes.statusCode).toEqual(StatusCodes.OK);
        })
    })
})