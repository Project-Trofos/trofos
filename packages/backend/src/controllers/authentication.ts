import StatusCodes from 'http-status-codes';
import express from 'express';
import authenticationService  from '../services/authentication.service';
import sessionService from '../services/session.service';
import roleService from '../services/role.service';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

const loginUser = async (req : express.Request, res: express.Response) => {
  const { userEmail, userPassword } = req.body;

  try {
    const isValidUser = await authenticationService.validateUser(userEmail, userPassword);

    if (!isValidUser) {
      return res.status(StatusCodes.UNAUTHORIZED).send();
    }
  
    const userRoleId = await roleService.getUserRoleId(userEmail);
    const sessionId = await sessionService.createUserSession(userEmail, userRoleId);

    res.cookie(TROFOS_SESSIONCOOKIE_NAME, sessionId);
    return res.status(StatusCodes.OK).send();
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }

};

const logoutUser = async (req : express.Request, res: express.Response) => {
  const sessionId = req.cookies[TROFOS_SESSIONCOOKIE_NAME];
  
  if (sessionId === undefined) {
    return res.status(StatusCodes.UNAUTHORIZED).send();
  }

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
    const userInformation = {
      userEmail : sessionInformation.user_email,
      userRole : sessionInformation.user_role_id,
    };
    return res.status(StatusCodes.OK).json(userInformation);
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

export default {
  loginUser,
  logoutUser,
  getUserInfo,
};