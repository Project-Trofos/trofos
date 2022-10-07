import StatusCodes from 'http-status-codes';
import express from 'express';
import authenticationService  from '../services/authentication.service';
import sessionService from '../services/session.service';
import roleService from '../services/role.service';
import accountService from '../services/account.service';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

const loginUser = async (req : express.Request, res: express.Response) => {
  const { userEmail, userPassword } = req.body;

  try {
    const userAuth = await authenticationService.validateUser(userEmail, userPassword);

    if (!userAuth.isValidUser) {
      return res.status(StatusCodes.UNAUTHORIZED).send();
    }
  
    const userRoleId = await roleService.getUserRoleId(userEmail);
    const userId = userAuth.userLoginInformation?.user_id as number
    const sessionId = await sessionService.createUserSession(userEmail, userRoleId, userId);

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
      userId : sessionInformation.user_id,
    };
    return res.status(StatusCodes.OK).json(userInformation);
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

const changePassword = async (req: express.Request, res: express.Response) => {
  const { userId, newUserPassword } = req.body;

  try {
    await accountService.changePassword(userId, newUserPassword)
    return res.status(StatusCodes.OK).send({ 
      message : "Password successfully changed" 
    });
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ 
      error : "Error while changing password" 
    });
  }
}

export default {
  loginUser,
  logoutUser,
  getUserInfo,
  changePassword
};