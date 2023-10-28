import { Server } from 'http';
import request from 'supertest';
import app, { port } from '../server';
import sessionService from '../services/session.service';
import authenticationService from '../services/authentication.service';
import roleService from '../services/role.service';
import { UserAuth } from '../services/types/authentication.service.types';

const authenticationServiceValidateUserSpy = jest.spyOn(authenticationService, 'validateUser');
const sessionServiceCreateUserSessionSpy = jest.spyOn(sessionService, 'createUserSession');
const roleServiceGetUserRoleInformationSpy = jest.spyOn(roleService, 'getUserRoleInformation');

describe('server.ts', () => {
  let server: Server;

  beforeAll(() => {
    server = app.listen(port);
  });

  afterAll((done) => {
    server.close();
    done();
  });

  test('/ route should return Hello World', async () => {
    const res = await request(server).get('/');
    expect(res.text).toEqual('Hello World!');
  });

  test('/account/login route should return session cookie', async () => {
    const sessionId = 'testSession';
    authenticationServiceValidateUserSpy.mockResolvedValueOnce({
      isValidUser: true,
      userLoginInformation: {
        user_email: 'testUser@test.com',
        user_id: 1,
      },
    } as UserAuth);
    sessionServiceCreateUserSessionSpy.mockResolvedValueOnce(sessionId);
    roleServiceGetUserRoleInformationSpy.mockResolvedValue({
      roleId: 1,
      roleActions: [],
      isAdmin: false,
    });
    const postData = {
      body: {
        userEmail: 'testUser@test.com',
        userPassword: 'testPassword',
      },
    };
    const res = await request(server).post('/api/account/login').send(postData);
    expect(res.headers['set-cookie']).toContain('trofos_sessioncookie=testSession; Path=/');
  });
});
