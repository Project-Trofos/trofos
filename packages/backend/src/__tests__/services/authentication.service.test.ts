import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import authenticationService from '../../services/authentication.service';
import { UserAuth } from '../../services/types/authentication.service.types';
import { userData } from '../mocks/userData';
import engineOauth2 from '../../auth/engine.oauth2';

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
        givenName: 'firstName',
        surname: 'lastName',
      };
      await expect(authenticationService.samlHandler(mockExtract)).rejects.toThrow(new Error());
    });
    it('should throw error if extract has no given name attribute', async () => {
      const mockExtract = {
        emailAddress: 'testEmail@test.com',
        surname: 'lastName',
      };
      await expect(authenticationService.samlHandler(mockExtract)).rejects.toThrow(new Error());
    });
    it('should throw error if extract has no surname attribute', async () => {
      const mockExtract = {
        emailAddress: 'testEmail@test.com',
        givenName: 'firstName',
      };
      await expect(authenticationService.samlHandler(mockExtract)).rejects.toThrow(new Error());
    });
    it('should return user information if the extract is valid', async () => {
      const mockExtract = {
        emailAddress: 'testUser@test.com',
        givenName: 'Test User',
        surname: '',
      };
      prismaMock.user.upsert.mockResolvedValueOnce(userData[0]);
      await expect(authenticationService.samlHandler(mockExtract)).resolves.toEqual(userData[0]);
    });
  });
});
