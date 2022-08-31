import request from 'supertest';
import server from '../index';
import sessionService from '../services/session.service';
import authenticationService from '../services/authentication.service';

const authenticationServiceValidateUserSpy = jest.spyOn(authenticationService, 'validateUser');
const sessionServiceCreateUserSessionSpy = jest.spyOn(sessionService, 'createUserSession');

import authentication from '../controllers/authentication';
import sessionService from '../services/session.service';
import authenticationService from '../services/authentication.service';

const authenticationServiceValidateUserSpy = jest.spyOn(authenticationService, 'validateUser');
const sessionServiceCreateUserSessionSpy = jest.spyOn(sessionService, 'createUserSession');

afterAll(done => {
  server.close();
  done();
});

describe('index.ts', () => {
  test('/ route should return Hello World', async () => {
    const res = await request(server).get('/');
    expect(res.text).toEqual('Hello World!');
  });

  test('/login route should return session cookie', async () => {
    const sessionId = 'testSession';
    authenticationServiceValidateUserSpy.mockResolvedValueOnce(true);
    sessionServiceCreateUserSessionSpy.mockResolvedValueOnce(sessionId);
    const postData = {
      body : {
        userEmail : "testUser@test.com",
        userPassword : "testPassword",
      },
    }
    const res = await request(server).post('/login').send(postData);
    expect(res.headers['set-cookie']).toContain("trofos_sessioncookie=testSession; Path=/");
  });
});
