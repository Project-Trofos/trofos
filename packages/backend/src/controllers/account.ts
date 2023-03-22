import StatusCodes from 'http-status-codes';
import express from 'express';
import authenticationService from '../services/authentication.service';
import sessionService from '../services/session.service';
import roleService from '../services/role.service';
import accountService from '../services/account.service';
import { assertInputIsNotEmpty, getDefaultErrorRes } from '../helpers/error';
import userService from '../services/user.service';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

const loginUser = async (req: express.Request, res: express.Response) => {
  const { userEmail, userPassword } = req.body;

  try {
    const userAuth = await authenticationService.validateUser(userEmail, userPassword);

    if (!userAuth.isValidUser) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send('Incorrect user credentials. Please double-check your credentials.');
    }
    
    const userId = userAuth.userLoginInformation.user_id;
    const userRoleInformation = await roleService.getUserRoleInformation(userId);
    const sessionId = await sessionService.createUserSession(userEmail, userRoleInformation, userId);

    res.cookie(TROFOS_SESSIONCOOKIE_NAME, sessionId);
    return res.status(StatusCodes.OK).send();
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

const oauth2Login = async (req: express.Request, res: express.Response) => {
  try {
    const { code, state, callbackUrl } = req.body;
    assertInputIsNotEmpty(code, 'Code');
    assertInputIsNotEmpty(state, 'State');
    assertInputIsNotEmpty(callbackUrl, 'Callback Url');

    const userInfo = await authenticationService.oauth2Handler(code, state, callbackUrl);
    const userRoleInformation = await roleService.getUserRoleInformation(userInfo.user_id);
    const sessionId = await sessionService.createUserSession(userInfo.user_email, userRoleInformation, userInfo.user_id);
    res.cookie(TROFOS_SESSIONCOOKIE_NAME, sessionId);
    return res.status(StatusCodes.OK).send();
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}

const logoutUser = async (req: express.Request, res: express.Response) => {
  const sessionId = req.cookies[TROFOS_SESSIONCOOKIE_NAME];

  try {
    await sessionService.deleteUserSession(sessionId);
    return res.status(StatusCodes.OK).send();
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

const getUserInfo = async (req: express.Request, res: express.Response) => {
  const sessionId = req.cookies[TROFOS_SESSIONCOOKIE_NAME];

  try {
    const sessionInformation = await sessionService.getUserSession(sessionId);
    const userAccountInformation = await userService.get(sessionInformation.user_id);
    const userRoleInformation = await roleService.getUserRoleInformation(sessionInformation.user_id);

    const userInformation = {
      userEmail: userAccountInformation.user_email,
      userDisplayName: userAccountInformation.user_display_name,
      userId: userAccountInformation.user_id,
      userRoleActions: userRoleInformation.roleActions,
    };

    return res.status(StatusCodes.OK).json(userInformation);
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

const changePassword = async (req: express.Request, res: express.Response) => {
  try {
    const { userId, oldUserPassword, newUserPassword } = req.body;

    assertInputIsNotEmpty(userId, 'User Id');
    assertInputIsNotEmpty(oldUserPassword, 'Old Password');
    assertInputIsNotEmpty(newUserPassword, 'New Password');

    await accountService.changePassword(userId, oldUserPassword, newUserPassword);
    return res.status(StatusCodes.OK).send({
      message: 'Password successfully changed',
    });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const updateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { userId, displayName } = req.body;

    assertInputIsNotEmpty(userId, 'User Id');
    assertInputIsNotEmpty(displayName, 'Display name');

    await accountService.updateUser(userId, displayName);
    return res.status(StatusCodes.OK).send({
      message: 'User info successfully updated',
    });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  loginUser,
  logoutUser,
  getUserInfo,
  changePassword,
  updateUser,
  oauth2Login
};
