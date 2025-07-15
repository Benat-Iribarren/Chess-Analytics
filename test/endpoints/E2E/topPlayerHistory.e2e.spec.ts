import app from '../../../src/index';
import supertest from 'supertest';
import nock from 'nock';
import mockTopPlayerOfBulletGames from '../../mocks/topPlayerOfBulletGames.json';
import mockPlayerRatingHistory from '../../mocks/playerRatingHistory.json';

describe('Top10 E2E tests', () => { 
  let request: any;
    const lichessApiScope = nock('https://lichess.org');
    const mode = 'bullet';
    const top = '1';

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

  it('Returns 200 with the enriched data if the external API succeeds', async () => {
    lichessApiScope.get(`/api/player/top/${top}/${mode}`).reply(200, mockTopPlayerOfBulletGames);
    lichessApiScope.get(`/api/user/Ediz_Gurel/rating-history`).reply(200, mockPlayerRatingHistory);

    const response = await request.get(`/chess/topPlayerHistory?mode=${mode}&top=${top}`);
    
    expect(response.statusCode).toBe(200);

    const body = response.body;
    expect(body.username).toBe('Ediz_Gurel');
    expect(body.history[0].date).toBe('2023-02-15');
    expect(body.history[0].rating).toBe(2846);
    expect(body.history[1].date).toBe('2023-02-16');
    expect(body.history[1].rating).toBe(2951);

    expect(nock.isDone()).toBe(true);
  });

  it('Returns 500 if the external Lichess API fails at first request', async () => {
    lichessApiScope.get(`/api/player/top/${top}/${mode}`).reply(500, { error: 'Server Error' });
    lichessApiScope.get(`/api/user/Ediz_Gurel/rating-history`).reply(200, mockPlayerRatingHistory);

    const response = await request.get(`/chess/topPlayerHistory?mode=${mode}&top=${top}`);
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error.' });
  });

  it('Returns 500 if the external Lichess API fails at second request', async () => {
    lichessApiScope.get(`/api/player/top/${top}/${mode}`).reply(200, mockTopPlayerOfBulletGames);
    lichessApiScope.get(`/api/user/Ediz_Gurel/rating-history`).reply(500, { error: 'Server Error' });

    const response = await request.get(`/chess/topPlayerHistory?mode=${mode}&top=${top}`);
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error.' });
  });
  
});