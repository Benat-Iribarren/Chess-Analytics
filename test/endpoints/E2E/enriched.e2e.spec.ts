import app from '../../../src/index';
import supertest from 'supertest';
import nock from 'nock';
import mockLichessUserData from '../../mocks/user-thibault.mock.json'; 
import mockLichessEnrichedData from '../../mocks/perf-blitz-thibault.mock.json'; 

describe('Top10 E2E tests', () => { 
  let request: any;
  const lichessApiScope = nock('https://lichess.org');
  const userId = 'thibault';
  const mode = 'blitz';

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
    lichessApiScope.get(`/api/user/${userId}`).reply(200, mockLichessUserData);
    lichessApiScope.get(`/api/user/${userId}/perf/${mode}`).reply(200, mockLichessEnrichedData);

    const response = await request.get(`/chess/enriched?id=${userId}&mode=${mode}`);
    
    expect(response.statusCode).toBe(200);

    const body = response.body;
    expect(body.id).toBe(userId);
    expect(body.username).toBe('thibault');
    expect(body.profile.bio).toBe('I turn coffee into bugs.');
    expect(body.playTime.total).toBe(6408249);
    expect(body.rank).toBe(null);
    expect(body.resultStreak.wins.current).toBe(1);
    expect(body.resultStreak.wins.max).toBe(11);
    expect(body.resultStreak.losses.current).toBe(0);
    expect(body.resultStreak.losses.max).toBe(19);

    expect(nock.isDone()).toBe(true);
  });

  it('Returns 500 if the external Lichess API fails at first request', async () => {
    lichessApiScope.get(`/api/user/${userId}`).reply(500, { error: 'Server Error' });
    lichessApiScope.get(`/api/user/${userId}/perf/${mode}`).reply(200, mockLichessEnrichedData);
    
    const response = await request.get(`/chess/enriched?id=${userId}&mode=${mode}`);
    
    expect(response.statusCode).toBe(500);
  });

  it('Returns 500 if the external Lichess API fails at second request', async () => {
    lichessApiScope.get(`/api/user/${userId}`).reply(200, mockLichessUserData);
    lichessApiScope.get(`/api/user/${userId}/perf/${mode}`).reply(500, { error: 'Server Error' });

    const response = await request.get(`/chess/enriched?id=${userId}&mode=${mode}`);
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error.' });
  });
});