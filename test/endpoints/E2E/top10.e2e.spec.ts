
import { build } from '../../../src/utils/build';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FastifyInstance } from 'fastify';
import mockLichessTop10Data from '../../mocks/top10.mock.json'; 
import { ERRORS } from '../../../src/endpoints/top10';

const LEADERBOARD_URL = 'https://lichess.org/api/player';

const server = setupServer(
  http.get(LEADERBOARD_URL, () => {
    return HttpResponse.json(mockLichessTop10Data);
  })
);

describe('Top10 E2E tests', () => { 
  let app: FastifyInstance;

  beforeAll(async () => {
    server.listen();
    app = build({ logger: false });
    await app.ready();
  });

  afterEach(() => server.resetHandlers());

  afterAll(async () => {
    server.close();
    await app.close();
  });

  const API_TOP10_ENDPOINT = '/chess/top10';
  it('Should return 200 with a structured list of top players if the external API succeeds', async () => {
    const response = await app.inject({
      method: 'GET',
      url: API_TOP10_ENDPOINT,
    });

    expect(response.statusCode).toBe(200);
    
    const body = response.json();
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
  });

  it('Should return 500 if the external API fails with an internal server error', async () => {
    server.use(
      http.get(LEADERBOARD_URL, () => {
        return HttpResponse.error();
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: API_TOP10_ENDPOINT,
    });
    
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });
});