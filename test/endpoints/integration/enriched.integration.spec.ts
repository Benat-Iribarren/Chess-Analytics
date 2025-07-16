import { build } from '../../../src/utils/build';
import { FastifyInstance } from 'fastify';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import mockLichessUserData from '../../mocks/user-thibault.mock.json';
import mockLichessPerfData from '../../mocks/perf-blitz-thibault.mock.json';

const server = setupServer(
  http.get('https://lichess.org/api/user/thibault', () => {
    return HttpResponse.json(mockLichessUserData);
  }),
  http.get('https://lichess.org/api/user/thibault/perf/blitz', () => {
    return HttpResponse.json(mockLichessPerfData);
  })
);
describe('Enriched integration tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    server.listen();
    app = build({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Returns enriched data if both axios calls succeed', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/enriched?id=thibault&mode=blitz'
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.id).toBe('thibault');
    expect(body.username).toBe('thibault');
    expect(body.profile.bio).toBe('I turn coffee into bugs.');
    expect(body.playTime.total).toBe(6408249);
    expect(body.rank).toBe(null);
    expect(body.resultStreak.wins.current).toBe(1);
    expect(body.resultStreak.wins.max).toBe(11);
    expect(body.resultStreak.losses.current).toBe(0);
    expect(body.resultStreak.losses.max).toBe(19);
  });

  it('Returns 400 if mode is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/enriched?id=thibault'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'id' or 'mode' parameter." });
  });

  it('Returns 400 if id is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/enriched?mode=blitz'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'id' or 'mode' parameter." });
  });

  it('Returns 404 if user is not found', async () => {
    server.use(
      http.get('https://lichess.org/api/user/this_is_not_a_user', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: '/chess/enriched?id=this_is_not_a_user&mode=blitz'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "User or Game Mode not found." });
  });

  it('Returns 404 if mode is not found', async () => {
    server.use(
      http.get('https://lichess.org/api/user/thibault/perf/this_is_not_a_mode', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: '/chess/enriched?id=thibault&mode=this_is_not_a_mode'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "User or Game Mode not found." });
  });
});