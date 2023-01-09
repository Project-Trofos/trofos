import StatusCodes from 'http-status-codes';
import express from 'express';
import authenticationService from '../services/authentication.service';
import sessionService from '../services/session.service';
import roleService from '../services/role.service';
import accountService from '../services/account.service';
import { assertInputIsNotEmpty, getDefaultErrorRes } from '../helpers/error';

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

    const userRoleInformation = await roleService.getUserRoleInformation(userEmail);
    const userId = userAuth.userLoginInformation?.user_id as number;
    const sessionId = await sessionService.createUserSession(userEmail, userRoleInformation, userId);

    res.cookie(TROFOS_SESSIONCOOKIE_NAME, sessionId);
    return res.status(StatusCodes.OK).send();
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

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
    const userRoleInformation = await roleService.getUserRoleInformation(sessionInformation.user_email);

    const userInformation = {
      userEmail: sessionInformation.user_email,
      userRoleActions: userRoleInformation.roleActions,
      userId: sessionInformation.user_id,
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

export default {
  loginUser,
  logoutUser,
  getUserInfo,
  changePassword,
};
