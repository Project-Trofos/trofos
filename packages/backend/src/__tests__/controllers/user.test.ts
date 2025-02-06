import { User } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import userService, { Users } from '../../services/user.service';
import user from '../../controllers/user';

const spies = {
  userServiceGetAllUsers: jest.spyOn(userService, 'getAll'),
  userServiceFindByEmail: jest.spyOn(userService, 'findByEmail'),
  userServiceCreateUser: jest.spyOn(userService, 'create'),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('user.controller tests', () => {
  describe('getAll', () => {
    it('should return all the users in the application if the query was successful', async () => {
      const userServiceResponseObject: Users[] = [
        {
          user_email: 'testEmail@test.com',
          user_id: 1,
          projects: [],
          basicRoles: [],
          courses: [],
        },
      ];
      spies.userServiceGetAllUsers.mockResolvedValueOnce(userServiceResponseObject);
      const mockReq = createRequest();
      const mockRes = createResponse();
      await expect(user.getAll(mockReq, mockRes));
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });

    it('should return status 500 INTERNAL SERVICE ERROR if an error occured during the query', async () => {
      const userServiceError = new Error('Something went wrong while querying users');
      spies.userServiceGetAllUsers.mockRejectedValueOnce(userServiceError);
      const mockReq = createRequest();
      const mockRes = createResponse();
      await user.getAll(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('createUser', () => {
    it('should return status 500 INTERNAL SERVICE ERROR if any of the parameters are missions', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();

      await user.create(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return status 500 INTERNAL SERVICE ERROR if any of the parameters are missions', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: 'testEmail@test.com',
        newPassword: 'testPassword',
      };

      const createUserError = new Error('Error while creating user');
      spies.userServiceCreateUser.mockRejectedValueOnce(createUserError);

      await user.create(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
    it('should successfully create the user if all fields are valid', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: 'testEmail@test.com',
        newPassword: 'testPassword',
      };

      const createdUser: User = {
        user_id: 1,
        user_email: 'testEmail@test.com',
        user_display_name: 'Test User',
        user_password_hash: 'testPassword',
        has_completed_tour: false,
      };
      spies.userServiceCreateUser.mockResolvedValueOnce(createdUser);

      await user.create(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getJSONData()).toEqual({ message: 'User successfully created' });
    });

    it('should convert email to lowercase', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: 'testEmail@test.com',
        newPassword: 'testPassword',
      };

      spies.userServiceCreateUser.mockImplementation((email) => {
        expect(email).toBe(mockReq.body.userEmail.toLowerCase());
        return Promise.resolve({
          user_id: 1,
          user_email: email,
          user_password_hash: '',
          user_display_name: '',
          has_completed_tour: false,
        });
      });

      await user.create(mockReq, mockRes);
    });
  });

  const existingUser: User = {
    user_id: 1,
    user_email: 'testEmail@test.com',
    user_display_name: 'Test User',
    user_password_hash: 'testPassword',
    has_completed_tour: true,
  };

  describe('queryEmail', () => {
    it('should find existing user', async () => {
      const expected = {
        exists: true,
      };

      spies.userServiceFindByEmail.mockResolvedValueOnce(existingUser);
      const mockReq = createRequest({
        params: {
          userEmail: existingUser.user_email,
        },
      });
      const mockRes = createResponse();

      await user.queryEmail(mockReq, mockRes);

      expect(spies.userServiceFindByEmail).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(expected));
    });

    it('should not find non-existing user', async () => {
      const expected = {
        exists: false,
      };

      spies.userServiceFindByEmail.mockResolvedValueOnce(null);
      const mockReq = createRequest({
        params: {
          userEmail: existingUser.user_email,
        },
      });
      const mockRes = createResponse();

      await user.queryEmail(mockReq, mockRes);

      expect(spies.userServiceFindByEmail).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(expected));
    });
  });
});
