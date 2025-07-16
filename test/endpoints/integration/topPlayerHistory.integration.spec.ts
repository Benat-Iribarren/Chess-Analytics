import { build } from '../../../src/utils/build';
import { FastifyInstance } from 'fastify';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import mockTop1Bullet from '../../mocks/top1-bullet.mock.json';
import mockEdizGurelHistory from '../../mocks/rating-history-edizgurel.mock.json';
import { ERRORS } from '../../../src/endpoints/topPlayerHistory';

const LEADERBOARD_INFO_URL = 'https://lichess.org/api/player/top/1/bullet';
const RATING_HISTORY_URL = 'https://lichess.org/api/user/Ediz_Gurel/rating-history';

const server = setupServer(
  http.get(LEADERBOARD_INFO_URL, () => {
    return HttpResponse.json(mockTop1Bullet);
  }),
  http.get(RATING_HISTORY_URL, () => {
    return HttpResponse.json(mockEdizGurelHistory);
  })
);

describe('Top Player History integration tests', () => {
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

  const TOP_PLAYER_HISTORY_URL = `/chess/topPlayerHistory`;
  const MODE = 'bullet';
  const TOP = '1';
  
  it('Should return the player history data if the external API succeeds', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `${TOP_PLAYER_HISTORY_URL}?mode=${MODE}&top=${TOP}`
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.username).toBe('Ediz_Gurel');
    expect(body.history).toBeInstanceOf(Array);
    expect(body.history.length).toBeGreaterThan(0);
    expect(body.history[0].date).toBe('2023-02-15');
    expect(body.history[0].rating).toBe(2846);
  });

  it('Should return 400 if mode is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `${TOP_PLAYER_HISTORY_URL}?top=${TOP}`
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: ERRORS.INVALID_OR_MISSING_MODE_OR_TOP });
  });
  it('Should return 400 if top is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `${TOP_PLAYER_HISTORY_URL}?mode=${MODE}`
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: ERRORS.INVALID_OR_MISSING_MODE_OR_TOP });
  });

  it('Should return 400 if top is not a number', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `${TOP_PLAYER_HISTORY_URL}?mode=${MODE}&top=not_a_number`
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: ERRORS.INVALID_OR_MISSING_MODE_OR_TOP });
  });

  it('Should return 400 if top is greater than 200', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `${TOP_PLAYER_HISTORY_URL}?mode=${MODE}&top=201`
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: ERRORS.INVALID_OR_MISSING_MODE_OR_TOP });
  });

  it('Should return 400 if top is less than 1', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `${TOP_PLAYER_HISTORY_URL}?mode=${MODE}&top=0`
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: ERRORS.INVALID_OR_MISSING_MODE_OR_TOP });
  });

  it('Should return 404 if mode is not found', async () => {
    const MODE_NOT_FOUND = 'this_is_not_a_mode';
    const LICHESS_API_URL = `https://lichess.org/api/player/top/${TOP}/${MODE_NOT_FOUND}`;
    
    server.use(
      http.get(LICHESS_API_URL, () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: `${TOP_PLAYER_HISTORY_URL}?mode=${MODE_NOT_FOUND}&top=${TOP}`
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: ERRORS.GAME_MODE_NOT_FOUND });
  });

  it('Should return 404 if top player is not found', async () => {
    server.use(
      http.get(LEADERBOARD_INFO_URL, () => {
        return HttpResponse.json({ users: [] });
      })
    );
    
    const response = await app.inject({
      method: 'GET',
      url: `${TOP_PLAYER_HISTORY_URL}?mode=${MODE}&top=${TOP}`
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: ERRORS.USER_NOT_FOUND }); 
  });
});