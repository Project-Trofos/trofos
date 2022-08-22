import request from 'supertest';
import server from '../index';

afterAll(done => {
  server.close();
  done();
});

describe('index.ts', () => {
  test('/ route should return Hello World', async () => {
    const res = await request(server).get('/');
    expect(res.text).toEqual('Hello World!');
  });
});
