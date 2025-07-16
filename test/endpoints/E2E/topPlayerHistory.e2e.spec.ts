import { build } from '../../../src/utils/build';
import supertest from 'supertest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FastifyInstance } from 'fastify';
import mockTopPlayerOfBulletGames from '../../mocks/top1-bullet.mock.json';
import mockPlayerRatingHistory from '../../mocks/rating-history-edizgurel.mock.json';
import { ERRORS } from '../../../src/endpoints/topPlayerHistory';

const server = setupServer(
  http.get('https://lichess.org/api/player/top/1/bullet', () => {
    return HttpResponse.json(mockTopPlayerOfBulletGames);
  }),
  http.get('https://lichess.org/api/user/Ediz_Gurel/rating-history', () => {
    return HttpResponse.json(mockPlayerRatingHistory);
  })
);

describe('Top Player History E2E tests', () => { 
  let app: FastifyInstance;
  let request: any;
    const mode = 'bullet';
    const top = '1';

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
    const response = await request.get(`/chess/topPlayerHistory?mode=${mode}&top=${top}`);
    
    expect(response.statusCode).toBe(200);

    const body = response.body;
    expect(body.username).toBe('Ediz_Gurel');
    expect(body.history[0].date).toBe('2023-02-15');
    expect(body.history[0].rating).toBe(2846);
    expect(body.history[1].date).toBe('2023-02-16');
    expect(body.history[1].rating).toBe(2951);

  });

  it('Should return 500 if the external Lichess API fails at first request', async () => {
    server.use(
      http.get('https://lichess.org/api/player/top/1/bullet', () => {
        return HttpResponse.error();
      })
    );

    const response = await request.get(`/chess/topPlayerHistory?mode=${mode}&top=${top}`);
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });

  it('Should return 500 if the external Lichess API fails at second request', async () => {
    server.use(
      http.get('https://lichess.org/api/user/Ediz_Gurel/rating-history', () => {
        return HttpResponse.error();
      })
    );

    const response = await request.get(`/chess/topPlayerHistory?mode=${mode}&top=${top}`);
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });
  
});