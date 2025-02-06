import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import authenticationService from '../../services/authentication.service';
import { UserAuth } from '../../services/types/authentication.service.types';
import { userData } from '../mocks/userData';
import engineOauth2 from '../../auth/engine.oauth2';
import { SAML_CLAIMS } from '../../helpers/ssoHelper';
import { FACULTY_ROLE_ID, STUDENT_ROLE_ID } from '../../helpers/constants';

const MOCK_CODE = 'mockCode';
const MOCK_STATE = 'mockState';
const MOCK_CALLBACK_URL = 'mockUrl';

const spies = {
  outh2EngineExecute: jest.spyOn(engineOauth2, 'execute'),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('authentication.service tests', () => {
  describe('validateUser', () => {
    it('should return true if the user is valid', async () => {
      const prismaResponseObject: User = {
        ...userData[0],
        user_password_hash: bcrypt.hashSync('testPassword', 10),
      };
      const responseObject = {
        isValidUser: true,
        userLoginInformation: {
          user_email: 'testUser@test.com',
          user_id: 1,
        },
      } as UserAuth;
      prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
      await expect(authenticationService.validateUser('testUser@test.com', 'testPassword')).resolves.toEqual(
        responseObject,
      );
    });

    it('should return false if there is no such user', async () => {
      const responseObject = {
        isValidUser: false,
      } as UserAuth;
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      await expect(authenticationService.validateUser('testUser@test.com', 'testPassword')).resolves.toEqual(
        responseObject,
      );
    });

    it('should return false if the credentials supplied are invalid', async () => {
      const prismaResponseObject: User = {
        ...userData[0],
        user_password_hash: bcrypt.hashSync('testPassword', 10),
      };
      const responseObject = {
        isValidUser: false,
        userLoginInformation: {
          user_email: 'testUser@test.com',
          user_id: 1,
        },
      } as UserAuth;
      prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
      await expect(authenticationService.validateUser('testUser@test.com', 'wrongTestPassword')).resolves.toEqual(
        responseObject,
      );
    });

    it('should return false if the user has an account but has not set a password', async () => {
      const prismaResponseObject: User = {
        ...userData[0],
        user_password_hash: null,
      };
      const responseObject = {
        isValidUser: false,
      } as UserAuth;
      prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
      await expect(authenticationService.validateUser('testUser@test.com', 'testPassword')).resolves.toEqual(
        responseObject,
      );
    });
  });

  describe('oauth2Handler', () => {
    it('should throw an error if the token could not be fetched', async () => {
      const expectedError = new Error('Error while fetching token from server');
      spies.outh2EngineExecute.mockRejectedValueOnce(expectedError);
      await expect(authenticationService.oauth2Handler(MOCK_CODE, MOCK_STATE, MOCK_CALLBACK_URL)).rejects.toThrow(
        expectedError,
      );
    });

    it('should throw an error if the token could not be decoded', async () => {
      const expectedError = new Error('Error while decoding access token');
      spies.outh2EngineExecute.mockRejectedValueOnce(expectedError);
      await expect(authenticationService.oauth2Handler(MOCK_CODE, MOCK_STATE, MOCK_CALLBACK_URL)).rejects.toThrow(
        expectedError,
      );
    });

    it('should return the user information if the token was fetched and decoded', async () => {
      const expectedUserEmail = userData[0].user_email;
      spies.outh2EngineExecute.mockResolvedValue(expectedUserEmail);
      prismaMock.user.upsert.mockResolvedValueOnce(userData[0]);
      await expect(authenticationService.oauth2Handler(MOCK_CODE, MOCK_STATE, MOCK_CALLBACK_URL)).resolves.toEqual(
        userData[0],
      );
    });
  });

  describe('samlHandler', () => {
    it('should throw error if extract has no email address attribute', async () => {
      const mockExtract = {
        [SAML_CLAIMS.GIVEN_NAME]: 'firstName',
        [SAML_CLAIMS.SURNAME]: 'lastName',
      };
      await expect(authenticationService.samlHandler(mockExtract)).rejects.toThrow();
    });
    it('should create a new user if the email does not exist in the database', async () => {
      const mockExtract = {
        [SAML_CLAIMS.EMAIL]: 'user@test.com',
        [SAML_CLAIMS.GIVEN_NAME]: 'New',
        [SAML_CLAIMS.SURNAME]: 'User',
      };

      const newUser: User = {
        user_id: 1,
        user_email: 'user@test.com',
        user_display_name: 'New User',
        user_password_hash: null,
        has_completed_tour: true,
      };

      prismaMock.user.upsert.mockResolvedValueOnce(newUser);

      const result = await authenticationService.samlHandler(mockExtract);

      expect(result).toEqual(newUser);
      expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { user_email: 'user@test.com' },
        update: {},
        create: {
          user_email: 'user@test.com',
          user_display_name: 'New User',
          basicRoles: { create: { role_id: STUDENT_ROLE_ID } },
        },
      });
    });
    it('should create a new user if extract has no surname, given name attribute', async () => {
      const mockExtract = {
        [SAML_CLAIMS.EMAIL]: 'user@test.com',
      };

      const newUser: User = {
        user_id: 1,
        user_email: 'user@test.com',
        user_display_name: 'user@test.com',
        user_password_hash: null,
        has_completed_tour: true,
      };

      prismaMock.user.upsert.mockResolvedValueOnce(newUser);

      const result = await authenticationService.samlHandler(mockExtract);

      expect(result).toEqual(newUser);
      expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { user_email: 'user@test.com' },
        update: {},
        create: {
          user_email: 'user@test.com',
          user_display_name: 'user@test.com',
          basicRoles: { create: { role_id: STUDENT_ROLE_ID } },
        },
      });
    });
    it('should return existing user information if the email already exists', async () => {
      const mockExtract = {
        [SAML_CLAIMS.EMAIL]: 'testUser@test.com',
        [SAML_CLAIMS.GIVEN_NAME]: 'Test',
        [SAML_CLAIMS.SURNAME]: 'User',
      };

      prismaMock.user.upsert.mockResolvedValueOnce(userData[0]);

      const result = await authenticationService.samlHandler(mockExtract);

      expect(result).toEqual(userData[0]);
      expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
    });
    it('should create a new user with lowercase email if the email is in uppercase', async () => {
      const mockExtract = {
        [SAML_CLAIMS.EMAIL]: 'USER@TEST.COM',
        [SAML_CLAIMS.GIVEN_NAME]: 'Upper',
        [SAML_CLAIMS.SURNAME]: 'Case',
      };

      const expectedUser: User = {
        user_id: 1,
        user_email: 'user@test.com',
        user_display_name: 'Upper Case',
        user_password_hash: null,
        has_completed_tour: true,
      };

      prismaMock.user.upsert.mockResolvedValueOnce(expectedUser);

      const result = await authenticationService.samlHandler(mockExtract);

      expect(result).toEqual(expectedUser);
      expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { user_email: 'user@test.com' },
        update: {},
        create: {
          user_email: 'user@test.com',
          user_display_name: 'Upper Case',
          basicRoles: { create: { role_id: STUDENT_ROLE_ID } },
        },
      });
    });
  });

  describe('samlHandlerStaff', () => {
    it('should throw error if extract has no email address attribute', async () => {
      const mockExtract = {
        [SAML_CLAIMS.GIVEN_NAME]: 'firstName',
        [SAML_CLAIMS.SURNAME]: 'lastName',
      };
      await expect(authenticationService.samlHandlerStaff(mockExtract)).rejects.toThrow();
    });
    it('should create a new user if the email does not exist in the database', async () => {
      const mockExtract = {
        [SAML_CLAIMS.EMAIL]: 'user@test.com',
        [SAML_CLAIMS.GIVEN_NAME]: 'New',
        [SAML_CLAIMS.SURNAME]: 'User',
      };

      const newUser: User = {
        user_id: 1,
        user_email: 'user@test.com',
        user_display_name: 'New User',
        user_password_hash: null,
        has_completed_tour: true,
      };

      prismaMock.user.upsert.mockResolvedValueOnce(newUser);

      const result = await authenticationService.samlHandlerStaff(mockExtract);

      expect(result).toEqual(newUser);
      expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { user_email: 'user@test.com' },
        update: {},
        create: {
          user_email: 'user@test.com',
          user_display_name: 'New User',
          basicRoles: { create: { role_id: FACULTY_ROLE_ID } },
        },
      });
    });
    it('should create a new user if extract has no surname, given name attribute', async () => {
      const mockExtract = {
        [SAML_CLAIMS.EMAIL]: 'user@test.com',
      };

      const newUser: User = {
        user_id: 1,
        user_email: 'user@test.com',
        user_display_name: 'user@test.com',
        user_password_hash: null,
        has_completed_tour: true,
      };

      prismaMock.user.upsert.mockResolvedValueOnce(newUser);

      const result = await authenticationService.samlHandlerStaff(mockExtract);

      expect(result).toEqual(newUser);
      expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { user_email: 'user@test.com' },
        update: {},
        create: {
          user_email: 'user@test.com',
          user_display_name: 'user@test.com',
          basicRoles: { create: { role_id: FACULTY_ROLE_ID } },
        },
      });
    });
    it('should return existing user information if the email already exists', async () => {
      const mockExtract = {
        [SAML_CLAIMS.EMAIL]: 'testUser@test.com',
        [SAML_CLAIMS.GIVEN_NAME]: 'Test',
        [SAML_CLAIMS.SURNAME]: 'User',
      };

      prismaMock.user.upsert.mockResolvedValueOnce(userData[0]);

      const result = await authenticationService.samlHandlerStaff(mockExtract);

      expect(result).toEqual(userData[0]);
      expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
    });
  });
  it('should create a new user with lowercase email if the email is in uppercase', async () => {
    const mockExtract = {
      [SAML_CLAIMS.EMAIL]: 'USER@TEST.COM',
      [SAML_CLAIMS.GIVEN_NAME]: 'Upper',
      [SAML_CLAIMS.SURNAME]: 'Case',
    };

    const expectedUser: User = {
      user_id: 1,
      user_email: 'user@test.com',
      user_display_name: 'Upper Case',
      user_password_hash: null,
      has_completed_tour: true,
    };

    prismaMock.user.upsert.mockResolvedValueOnce(expectedUser);

    const result = await authenticationService.samlHandlerStaff(mockExtract);

    expect(result).toEqual(expectedUser);
    expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { user_email: 'user@test.com' },
      update: {},
      create: {
        user_email: 'user@test.com',
        user_display_name: 'Upper Case',
        basicRoles: { create: { role_id: FACULTY_ROLE_ID } },
      },
    });
  });
});
