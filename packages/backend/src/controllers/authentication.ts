import StatusCodes from 'http-status-codes';
import express from 'express';
import authenticationService  from '../services/authentication.service';
import sessionService from '../services/session.service';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

const loginUser = async (req : express.Request, res: express.Response) => {
  const { userEmail, userPassword } = req.body;

  try {
    const isValidUser = await authenticationService.validateUser(userEmail, userPassword);

    if (!isValidUser) {
      return res.status(StatusCodes.UNAUTHORIZED).send();
    }
  
    const sessionId = await sessionService.createUserSession(userEmail);

    res.cookie(TROFOS_SESSIONCOOKIE_NAME, sessionId);
    return res.status(StatusCodes.OK).send();
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }

};

export default {
  loginUser,
};