import request from 'supertest';
import server from '../index';
import sessionService from '../services/session.service';
import authenticationService from '../services/authentication.service';
import roleService from '../services/role.service';
import { UserAuth } from '../services/types/authentication.service.types';

const authenticationServiceValidateUserSpy = jest.spyOn(authenticationService, 'validateUser');
const sessionServiceCreateUserSessionSpy = jest.spyOn(sessionService, 'createUserSession');
const roleServiceGetUserRoleIdSpy = jest.spyOn(roleService, 'getUserRoleId');

afterAll(done => {
  server.close();
  done();
});

describe('index.ts', () => {
  test('/ route should return Hello World', async () => {
    const res = await request(server).get('/');
    expect(res.text).toEqual('Hello World!');
  });

  test('/account/login route should return session cookie', async () => {
    const sessionId = 'testSession';
    authenticationServiceValidateUserSpy.mockResolvedValueOnce({
      isValidUser : true,
      userLoginInformation : {
        user_email : "testUser@test.com",
        user_id : 1
      }
    } as UserAuth);
    sessionServiceCreateUserSessionSpy.mockResolvedValueOnce(sessionId);
    roleServiceGetUserRoleIdSpy.mockResolvedValue(1);
    const postData = {
      body : {
        userEmail : 'testUser@test.com',
        userPassword : 'testPassword',
      },
    };
    const res = await request(server).post('/account/login').send(postData);
    expect(res.headers['set-cookie']).toContain('trofos_sessioncookie=testSession; Path=/');
  });
});
