import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { assertInputIsNotEmpty, assertStringIsNumberOrThrow, getDefaultErrorRes } from '../helpers/error';
import roleService from '../services/role.service';

async function getAllRoles(req: express.Request, res: express.Response) {
  try {
    const roles = await roleService.getAllRoles();
    return res.status(StatusCodes.OK).json(roles);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getAllActions(req: express.Request, res: express.Response) {
  try {
    const actions = roleService.getAllActions();
    return res.status(StatusCodes.OK).json(actions);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getRoleActions(req: express.Request, res: express.Response) {
  try {
    const roleActions = await roleService.getRoleActions();
    return res.status(StatusCodes.OK).json(roleActions);
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getUserRoleActionsForCourse(req: express.Request, res: express.Response) {
  try {
    const { userId, courseId } = req.body;
    assertInputIsNotEmpty(courseId, 'Course Id');
    assertStringIsNumberOrThrow(userId, 'User id must be a number');
    const userRolesForCourse = await roleService.getUserRoleActionsForCourse(Number(userId), courseId);
    return res.status(StatusCodes.OK).json(userRolesForCourse);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getUserRoleActionsForProject(req: express.Request, res: express.Response) {
  try {
    const { userId, projectId } = req.body;
    assertInputIsNotEmpty(projectId, 'Project Id');
    assertStringIsNumberOrThrow(userId, 'User id must be a number');
    const userRolesForProject = await roleService.getUserRoleActionsForProject(Number(userId), projectId);
    return res.status(StatusCodes.OK).json(userRolesForProject);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getUserRolesForCourse(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    assertStringIsNumberOrThrow(courseId, 'Course id must be a number');
    const userRolesForCourse = await roleService.getUserRolesForCourse(Number(courseId));
    return res.status(StatusCodes.OK).json(userRolesForCourse);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getUserRolesForProject(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    assertStringIsNumberOrThrow(projectId, 'Project id must be a number');
    const userRolesForProject = await roleService.getUserRolesForProject(Number(projectId));
    return res.status(StatusCodes.OK).json(userRolesForProject);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function updateUserRoleForCourse(req: express.Request, res: express.Response) {
  try {
    const { courseId } = req.params;
    const { userRole, userId } = req.body;
    assertInputIsNotEmpty(userId, 'User Id');
    assertInputIsNotEmpty(userRole, 'User Role Id');
    assertStringIsNumberOrThrow(courseId, 'Course id must be a number');
    await roleService.updateUserRoleForCourse(Number(courseId), Number(userRole), Number(userId));
    return res.status(StatusCodes.OK).json();
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function updateUserRoleForProject(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const { userRole, userId } = req.body;
    assertInputIsNotEmpty(userId, 'User Id');
    assertInputIsNotEmpty(userRole, 'User Role Id');
    assertStringIsNumberOrThrow(projectId, 'Project id must be a number');
    await roleService.updateUserRoleForProject(Number(projectId), Number(userRole), Number(userId));
    return res.status(StatusCodes.OK).json();
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function updateUserRole(req: express.Request, res: express.Response) {
  try {
    const { newRoleId, userId } = req.body;
    assertInputIsNotEmpty(newRoleId, 'Role id');
    assertStringIsNumberOrThrow(userId, 'User id must be a number');

    const requestorId = res.locals.userSession.user_id;
    if (requestorId === Number(userId)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Admin cannot modify their own role' });
    }
    const updatedRole = await roleService.updateUserRole(newRoleId, Number(userId));
    return res.status(StatusCodes.OK).json({ message: 'Successfully updated', data: updatedRole });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  getAllRoles,
  getAllActions,
  getRoleActions,
  addActionToRole,
  removeActionFromRole,
  getUserRoleActionsForCourse,
  getUserRoleActionsForProject,
  getUserRolesForCourse,
  getUserRolesForProject,
  updateUserRoleForCourse,
  updateUserRoleForProject,
  updateUserRole,
};
