import { build } from '../../../src/utils/build';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FastifyInstance } from 'fastify';
import mockLichessUserData from '../../mocks/user-thibault.mock.json'; 
import mockLichessEnrichedData from '../../mocks/perf-blitz-thibault.mock.json'; 
import { ERRORS } from '../../../src/endpoints/enriched';

const USER_ID = 'thibault';
const MODE = 'blitz';
const LICHESS_API_USER_URL = `https://lichess.org/api/user/${USER_ID}`;
const LICHESS_API_PERF_URL = `https://lichess.org/api/user/${USER_ID}/perf/${MODE}`;

const server = setupServer(
  http.get(LICHESS_API_USER_URL, () => {
    return HttpResponse.json(mockLichessUserData);
  }),
  http.get(LICHESS_API_PERF_URL, () => {
    return HttpResponse.json(mockLichessEnrichedData);
  })
);

describe('Enriched E2E tests', () => { 
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

  const API_ENRICHED_ENDPOINT = `/chess/enriched`;
  it('Should return 200 with the enriched data if the external API succeeds', async () => {
    const response = await app.inject({
      method: 'GET',
      url: API_ENRICHED_ENDPOINT,
      query: { id: USER_ID, mode: MODE }
    });
    
    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.id).toBe(USER_ID);
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
      http.get(LICHESS_API_USER_URL, () => {
        return HttpResponse.error();
      })
    );
    
    const response = await app.inject({
      method: 'GET',
      url: API_ENRICHED_ENDPOINT,
      query: { id: USER_ID, mode: MODE }
    });
    
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });

  it('Should return 500 if the external Lichess API fails at second request', async () => {
    server.use(
      http.get(LICHESS_API_PERF_URL, () => {
        return HttpResponse.error();
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: API_ENRICHED_ENDPOINT,
      query: { id: USER_ID, mode: MODE }
    });
    
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });
});