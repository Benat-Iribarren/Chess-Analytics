import app from '../../../src/index';
import supertest from 'supertest';
import nock from 'nock';
import mockLichessData from '../../mocks/top10.json'; 

describe('Top10 E2E tests', () => { 
  let request: any;
  const lichessApiScope = nock('https://lichess.org');

  beforeAll(async () => {
    await app.ready();
    request = supertest(app.server as any);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await app.close();
    nock.restore();
  });

  it('should return 200 with a structured list of top players', async () => {
    lichessApiScope.get('/api/player').reply(200, mockLichessData);
    const response = await request.get('/chess/top10');

    expect(response.statusCode).toBe(200);
    
    const body = response.body;
    expect(body).toHaveProperty('bullet');

    const firstBulletPlayer = body.bullet[0];
    expect(firstBulletPlayer.id).toBe('ediz_gurel');
    expect(firstBulletPlayer).not.toHaveProperty('perfs');
    expect(firstBulletPlayer).toHaveProperty('modes');
    expect(firstBulletPlayer.modes.bullet.rating).toBe(3371);

    const secondBlitzPlayer = body.blitz[1];
    expect(secondBlitzPlayer.id).toBe('iammatecheckmate');
    expect(secondBlitzPlayer.modes.blitz.rating).toBe(3031);

    const thirdBulletPlayer = body.bullet[2];
    expect(thirdBulletPlayer.id).toBe('heisenberg01');
    expect(thirdBulletPlayer.modes.bullet.rating).toBe(3235);
    expect(thirdBulletPlayer.modes.bullet.progress).toBe(26);
    expect(thirdBulletPlayer.title).toBe('FM');


    expect(nock.isDone()).toBe(true); 
  });

  it('should return 500 if the external API fails', async () => {
    lichessApiScope.get('/api/player').reply(500, { error: 'Server Error' });

    const response = await request.get('/chess/top10');
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error.' });
    expect(nock.isDone()).toBe(true);
  });
});