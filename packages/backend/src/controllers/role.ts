import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { assertInputIsNotEmpty, assertStringIsNumberOrThrow, getDefaultErrorRes } from '../helpers/error';
import roleService from "../services/role.service";

async function getAllActions(req: express.Request, res: express.Response) {
    try {
        const actions = roleService.getAllActions();
        return res.status(StatusCodes.OK).json(actions);
    } catch (error : any) {
        getDefaultErrorRes(error, res);
    }
}

async function getRoleActions(req: express.Request, res: express.Response) {
    try {
        const roleActions = await roleService.getRoleActions();
        return res.status(StatusCodes.OK).json(roleActions);
    } catch (error : any) {
        getDefaultErrorRes(error, res);
    }
}

async function addActionToRole(req: express.Request, res: express.Response) {
    try {
        const { roleId, action } = req.body;
        assertStringIsNumberOrThrow(roleId, "Role id must be a number");
        assertInputIsNotEmpty(action, "Role action");
        const roleAction = await roleService.addActionToRole(roleId, action);
        return res.status(StatusCodes.OK).json({ message: "Successfully added", data : roleAction})
    } catch (error : any) {
        getDefaultErrorRes(error, res);
    }
}

async function removeActionFromRole(req: express.Request, res: express.Response) {
    try {
        const { roleId, action } = req.body;
        assertStringIsNumberOrThrow(roleId, "Role id must be a number");
        assertInputIsNotEmpty(action, "Role action");
        const roleAction = await roleService.removeActionFromRole(roleId, action);
        return res.status(StatusCodes.OK).json({ message: "Successfully removed", data : roleAction})
    } catch (error : any) {
        getDefaultErrorRes(error, res);
    }
}

export default {
    getAllActions,
    getRoleActions,
    addActionToRole,
    removeActionFromRole
}