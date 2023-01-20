import express from 'express';
import { STATUS_CODES } from 'http';
import { StatusCodes } from 'http-status-codes';
import { ADMIN_ROLE_ID } from '../helpers/constants';
import { assertInputIsNotEmpty, assertStringIsNumberOrThrow, getDefaultErrorRes } from '../helpers/error';
import roleService from '../services/role.service';
import user from './user';


async function getAllRoles(req: express.Request, res: express.Response) {
  try {
    const roles = await roleService.getAllRoles();
    return res.status(StatusCodes.OK).json(roles);
  } catch (error : any) {
    return getDefaultErrorRes(error, res);
  }
}

async function getAllActions(req: express.Request, res: express.Response) {
  try {
    const actions = roleService.getAllActions();
    return res.status(StatusCodes.OK).json(actions);
  } catch (error: any) {
    return getDefaultErrorRes(error, res);
  }
}

async function getRoleActions(req: express.Request, res: express.Response) {
  try {
    const roleActions = await roleService.getRoleActions();
    return res.status(StatusCodes.OK).json(roleActions);
  } catch (error: any) {
    return getDefaultErrorRes(error, res);
  }
}

async function addActionToRole(req: express.Request, res: express.Response) {
  try {
    const { roleId, action } = req.body;
    assertStringIsNumberOrThrow(roleId, 'Role id must be a number');
    assertInputIsNotEmpty(action, 'Role action');
    const roleAction = await roleService.addActionToRole(roleId, action);
    return res.status(StatusCodes.OK).json({ message: 'Successfully added', data: roleAction });
  } catch (error: any) {
    return getDefaultErrorRes(error, res);
  }
}

async function removeActionFromRole(req: express.Request, res: express.Response) {
  try {
    const { roleId, action } = req.body;
    assertStringIsNumberOrThrow(roleId, 'Role id must be a number');
    assertInputIsNotEmpty(action, 'Role action');
    const roleAction = await roleService.removeActionFromRole(roleId, action);
    return res.status(StatusCodes.OK).json({ message: 'Successfully removed', data: roleAction });
  } catch (error: any) {
    return getDefaultErrorRes(error, res);
  }
}

async function updateUserRole(req: express.Request, res: express.Response) {
  try {
    const { newRoleId, userEmail } = req.body;
    assertInputIsNotEmpty(newRoleId, 'Role id');
    assertInputIsNotEmpty(userEmail, 'User email');

    const requestorEmail = res.locals.userSession.user_email;
    if (requestorEmail === userEmail) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Admin cannot modify their own role"});
    }
    const updatedRole = await roleService.updateUserRole(newRoleId, userEmail);
    return res.status(StatusCodes.OK).json({ message: 'Successfully updated', data: updatedRole});
  } catch (error : any) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  getAllRoles,
  getAllActions,
  getRoleActions,
  addActionToRole,
  removeActionFromRole,
  updateUserRole,
};
