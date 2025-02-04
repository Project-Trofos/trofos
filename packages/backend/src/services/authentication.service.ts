import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import oauth2Engine from '../auth/engine.oauth2';
import { FACULTY_ROLE_ID, STUDENT_ROLE_ID } from '../helpers/constants';
import prisma from '../models/prismaClient';
import { UserAuth } from './types/authentication.service.types';
import { SAML_CLAIMS } from '../helpers/ssoHelper';

async function validateUser(userEmail: string, userPassword: string): Promise<UserAuth> {
  let userAuth: UserAuth;
  const userLoginInformation = await prisma.user.findUnique({
    where: {
      user_email: userEmail.toLowerCase(),
    },
  });

  if (!userLoginInformation?.user_password_hash) {
    userAuth = {
      isValidUser: false,
    };

    return userAuth;
  }

  const storedPassword = userLoginInformation.user_password_hash as string;
  const isValidUser = await bcrypt.compare(userPassword, storedPassword);

  userAuth = {
    isValidUser,
    userLoginInformation: {
      user_email: userLoginInformation.user_email,
      user_id: userLoginInformation.user_id,
    } as User,
  };

  return userAuth;
}

async function oauth2Handler(code: string, state: string, callbackUrl: string): Promise<User> {
  const userEmail = await oauth2Engine.execute(code, state, callbackUrl);

  // If the user does not exist, we create an account for them
  // Otherwise, we return their account information
  const userInfo = await prisma.user.upsert({
    where: {
      user_email: userEmail,
    },
    update: {},
    create: {
      user_email: userEmail,
      user_display_name: userEmail,
      basicRoles: {
        create: {
          role_id: STUDENT_ROLE_ID, // Default role of a new user
        },
      },
    },
  });

  return userInfo;
}

async function samlHandler(attributes: any): Promise<User> {
  const userEmail = attributes[SAML_CLAIMS.EMAIL];
  const surname = attributes[SAML_CLAIMS.SURNAME];
  const givenName = attributes[SAML_CLAIMS.GIVEN_NAME];

  if (!userEmail && !surname && !givenName) {
    throw new Error('Invalid SAML response: Missing required attributes.');
  }

  const displayName = `${givenName} ${surname || ''}`.trim();

  // If the user does not exist, we create an account for them
  // Otherwise, we return their account information
  const userInfo = await prisma.user.upsert({
    where: {
      user_email: userEmail,
    },
    update: {},
    create: {
      user_email: userEmail,
      user_display_name: displayName ? displayName : userEmail, // If display name is empty, use email
      basicRoles: {
        create: {
          role_id: STUDENT_ROLE_ID, // Default role of a new user
        },
      },
    },
  });

  return userInfo;
}

async function samlHandlerStaff(attributes: any): Promise<User> {
  const userEmail = attributes[SAML_CLAIMS.EMAIL];
  const surname = attributes[SAML_CLAIMS.SURNAME];
  const givenName = attributes[SAML_CLAIMS.GIVEN_NAME];

  if (!userEmail && !surname && !givenName) {
    throw new Error('Invalid SAML response: Missing required attributes.');
  }

  const displayName = `${givenName} ${surname || ''}`.trim();

  // If the user does not exist, we create an account for them
  // Otherwise, we return their account information
  const userInfo = await prisma.user.upsert({
    where: {
      user_email: userEmail,
    },
    update: {},
    create: {
      user_email: userEmail,
      user_display_name: displayName ? displayName : userEmail, // If display name is empty, use email
      basicRoles: {
        create: {
          role_id: FACULTY_ROLE_ID, // Default role of a new staff
        },
      },
    },
  });

  return userInfo;
}

export default {
  validateUser,
  oauth2Handler,
  samlHandler,
  samlHandlerStaff,
};
