import StatusCodes from 'http-status-codes';
import express from 'express';
import authenticationService from '../services/authentication.service';
import sessionService from '../services/session.service';
import roleService from '../services/role.service';
import accountService from '../services/account.service';
import { assertInputIsNotEmpty, getDefaultErrorRes, getErrorMessage } from '../helpers/error';
import userService from '../services/user.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { getCachedIdp, getCachedSp, getCachedIdpStaff, getCachedSpStaff, SSORoles } from '../helpers/ssoHelper';
import { assertSSORoleIsValid } from '../helpers/error/assertions';

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
    const sessionId = await sessionService.createUserSession(
      userInfo.user_email,
      userRoleInformation,
      userInfo.user_id,
    );
    res.cookie(TROFOS_SESSIONCOOKIE_NAME, sessionId);
    return res.status(StatusCodes.OK).send();
  } catch (e) {
    return getDefaultErrorRes(e, res);
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

async function register(req: express.Request, res: express.Response) {
  try {
    const { userEmail, userPassword, userDisplayName } = req.body;

    assertInputIsNotEmpty<string>(userEmail, 'User Email');
    assertInputIsNotEmpty<string>(userPassword, 'User Password');
    assertInputIsNotEmpty<string>(userDisplayName, 'User Display Name');

    await accountService.register(userEmail.toLowerCase(), userPassword, userDisplayName);

    return res.status(StatusCodes.OK).json({ message: 'User successfully created' });
  } catch (error) {
    console.error(error);
    const err = error as PrismaClientKnownRequestError;
    if (err.code == 'P2002') return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email already in use' });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
}

async function generateSAMLRequest(req: express.Request, res: express.Response) {
  try {
    const sp = await getCachedSp();
    const idp = await getCachedIdp();

    // Create auth SAML request
    const { id, context } = sp.createLoginRequest(idp, 'redirect');

    console.log('Generated SAML Request ID:', id);
    console.log('Redirect URL:', context);

    return res.status(StatusCodes.OK).json({ redirectUrl: context });
  } catch (error) {
    console.error('Error generating SAML request:', error);
    return getDefaultErrorRes(error, res);
  }
}

async function generateSAMLRequestStaff(req: express.Request, res: express.Response) {
  try {
    const sp = await getCachedSpStaff();
    const idp = await getCachedIdpStaff();

    // Create auth SAML request
    const { id, context } = sp.createLoginRequest(idp, 'redirect');

    console.log('Generated SAML Request ID:', id);
    console.log('Redirect URL:', context);

    return res.status(StatusCodes.OK).json({ redirectUrl: context });
  } catch (error) {
    console.error('Error generating SAML request:', error);
    return getDefaultErrorRes(error, res);
  }
}

async function processSAMLResponse(req: express.Request, res: express.Response) {
  try {
    const { SAMLResponse, RelayState: relayState } = req.body; // Extract the SAML Response from the POST body

    if (!SAMLResponse) {
      throw new Error('Missing SAMLResponse');
    }
    assertSSORoleIsValid(relayState);

    if (relayState === SSORoles.STAFF) {
      await processSAMLResponseStaff(req, res);
    } else if (relayState === SSORoles.STUDENT) {
      await processSAMLResponseStudent(req, res);
    }
  } catch (error) {
    console.error('Error processing SAML Response:', error);
    return getDefaultErrorRes(error, res);
  }
}

async function processSAMLResponseStudent(req: express.Request, res: express.Response) {
  const sp = await getCachedSp();
  const idp = await getCachedIdp();

  // Parse the SAML response
  const parsedResponse = await sp.parseLoginResponse(idp, 'post', req);
  const { extract } = parsedResponse;

  // Validate parsed response
  if (!extract || !extract.attributes) {
    throw new Error('Invalid SAML extract.');
  }

  // Handle user authentication and session creation
  const userInfo = await authenticationService.samlHandler(extract.attributes);
  const userRoleInformation = await roleService.getUserRoleInformation(userInfo.user_id);
  const sessionId = await sessionService.createUserSession(userInfo.user_email, userRoleInformation, userInfo.user_id);

  // Set secure cookie for session
  res.cookie(TROFOS_SESSIONCOOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  // Redirect the user to the homepage
  return res.redirect('/');
}

async function processSAMLResponseStaff(req: express.Request, res: express.Response) {
  const sp = await getCachedSpStaff();
  const idp = await getCachedIdpStaff();

  // Parse the SAML response
  const parsedResponse = await sp.parseLoginResponse(idp, 'post', req);
  const { extract } = parsedResponse;

  // Validate parsed response
  if (!extract || !extract.attributes) {
    throw new Error('Invalid SAML extract.');
  }

  // Handle user authentication and session creation
  const userInfo = await authenticationService.samlHandlerStaff(extract.attributes);
  const userRoleInformation = await roleService.getUserRoleInformation(userInfo.user_id);
  const sessionId = await sessionService.createUserSession(userInfo.user_email, userRoleInformation, userInfo.user_id);

  // Set secure cookie for session
  res.cookie(TROFOS_SESSIONCOOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  // Redirect the user to the homepage
  return res.redirect('/');
}

export default {
  loginUser,
  logoutUser,
  getUserInfo,
  changePassword,
  updateUser,
  oauth2Login,
  register,
  generateSAMLRequest,
  generateSAMLRequestStaff,
  processSAMLResponse,
};
