import app from '../../../src/index';
import supertest from 'supertest';


describe('User E2E tests', () => { 
  let request: any;

  beforeAll(async () => {
    await app.ready();
    request = supertest(app.server as any);
  });

  afterAll(async () => {
    await app.close();
  });
  
  it('Returns 200 and complete user info for a valid user id', async () => {
    const id='thibault';
    const response = await request.get(`/chess/user?id=${id}`);
    expect(response.statusCode).toBe(200);
    expect(typeof response.body.profile).toBe('object');
    expect(response.body).not.toBeNull();
    expect(response.body.id).toBe(id);
    expect(response.body.username).toBe(id);
    expect(response.body.playTime).toBeDefined();
  });
});