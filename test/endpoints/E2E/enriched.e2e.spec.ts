import { build } from '../../../src/utils/build';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import mockLichessUserData from '../../mocks/user-thibault.mock.json'; 
import mockLichessEnrichedData from '../../mocks/perf-blitz-thibault.mock.json'; 
import { ERRORS } from '../../../src/endpoints/enriched';

const server = setupServer(
  http.get('https://lichess.org/api/user/thibault', () => {
    return HttpResponse.json(mockLichessUserData);
  }),
  http.get('https://lichess.org/api/user/thibault/perf/blitz', () => {
    return HttpResponse.json(mockLichessEnrichedData);
  })
);

describe('Enriched E2E tests', () => { 
  let app: FastifyInstance;
  let request: any;
  const userId = 'thibault';
  const mode = 'blitz';

  beforeAll(async () => {
    server.listen();
    app = build({ logger: false });
    await app.ready();
    request = supertest(app.server as any);
  });

  afterEach(() => server.resetHandlers());

  afterAll(async () => {
    server.close();
    await app.close();
  });

  it('Should return 200 with the enriched data if the external API succeeds', async () => {
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

  });

  it('Should return 500 if the external Lichess API fails at first request', async () => {
    server.use(
      http.get('https://lichess.org/api/user/thibault', () => {
        return HttpResponse.error();
      })
    );
    
    const response = await request.get(`/chess/enriched?id=${userId}&mode=${mode}`);
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });

  it('Should return 500 if the external Lichess API fails at second request', async () => {
    server.use(
      http.get('https://lichess.org/api/user/thibault/perf/blitz', () => {
        return HttpResponse.error();
      })
    );

    const response = await request.get(`/chess/enriched?id=${userId}&mode=${mode}`);
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });
});