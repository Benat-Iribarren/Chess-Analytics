import { build } from '../../../src/utils/build';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FastifyInstance } from 'fastify';
import mockTopPlayerOfBulletGames from '../../mocks/top1-bullet.mock.json';
import mockPlayerRatingHistory from '../../mocks/rating-history-edizgurel.mock.json';
import { ERRORS } from '../../../src/endpoints/topPlayerHistory';

const USER_ID = 'Ediz_Gurel';
const MODE = 'bullet';
const TOP = '1';

const LEADERBOARD_INFO_URL = `https://lichess.org/api/player/top/${TOP}/${MODE}`;
const RATING_HISTORY_URL = `https://lichess.org/api/user/${USER_ID}/rating-history`;


const server = setupServer(
  http.get(LEADERBOARD_INFO_URL, () => {
    return HttpResponse.json(mockTopPlayerOfBulletGames);
  }),
  http.get(RATING_HISTORY_URL, () => {
    return HttpResponse.json(mockPlayerRatingHistory);
  })
);

describe('Top Player History E2E tests', () => { 
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

  const API_TOP_PLAYER_HISTORY_ENDPOINT = `/chess/topPlayerHistory`;
  it('Should return 200 with the top player history data if the external API succeeds', async () => {
    const response = await app.inject({
      method: 'GET',
      url: API_TOP_PLAYER_HISTORY_ENDPOINT,
      query: { mode: MODE, top: TOP }
    });
    
    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.username).toBe('Ediz_Gurel');
    expect(body.history[0].date).toBe('2023-02-15');
    expect(body.history[0].rating).toBe(2846);
    expect(body.history[1].date).toBe('2023-02-16');
    expect(body.history[1].rating).toBe(2951);

  });

  it('Should return 500 if the external Lichess API fails at first request', async () => {
    server.use(
      http.get(LEADERBOARD_INFO_URL, () => {
        return HttpResponse.error();
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: API_TOP_PLAYER_HISTORY_ENDPOINT,
      query: { mode: MODE, top: TOP }
    });
    
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });

  it('Should return 500 if the external Lichess API fails at second request', async () => {
    server.use(
      http.get(RATING_HISTORY_URL, () => {
        return HttpResponse.error();
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: API_TOP_PLAYER_HISTORY_ENDPOINT,
      query: { mode: MODE, top: TOP }
    });
    
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });
  
});