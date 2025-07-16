import { build } from '../../../src/utils/build';
import { FastifyInstance } from 'fastify';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import mockTop1Bullet from '../../mocks/top1-bullet.mock.json';
import mockEdizGurelHistory from '../../mocks/rating-history-edizgurel.mock.json';

const server = setupServer(
  http.get('https://lichess.org/api/player/top/1/bullet', () => {
    return HttpResponse.json(mockTop1Bullet);
  }),
  http.get('https://lichess.org/api/user/Ediz_Gurel/rating-history', () => {
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

  it('Returns player history data if both axios calls succeed', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet&top=1'
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.username).toBe('Ediz_Gurel');
    expect(body.history).toBeInstanceOf(Array);
    expect(body.history.length).toBeGreaterThan(0);
    expect(body.history[0].date).toBe('2023-02-15');
    expect(body.history[0].rating).toBe(2846);
  });

  it('Returns 400 if mode is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?top=1'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'mode' or 'top' parameter." });
  });
  it('Returns 400 if top is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'mode' or 'top' parameter." });
  });

  it('Returns 400 if top is not a number', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet&top=not_a_number'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'mode' or 'top' parameter." });
  });

  it('Return 400 if top is greater than 200', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet&top=201'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'mode' or 'top' parameter." });
  });

  it('Returns 400 if top is less than 1', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet&top=0'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'mode' or 'top' parameter." });
  });

  it('Returns 404 if mode is not found', async () => {
    server.use(
      http.get('https://lichess.org/api/player/top/1/this_is_not_a_mode', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=this_is_not_a_mode&top=1'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "Game Mode not found." });
  });

  it('Returns 404 if top player is not found', async () => {
    server.use(
      http.get('https://lichess.org/api/player/top/1/bullet', () => {
        return HttpResponse.json({ users: [] });
      })
    );
    
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet&top=1'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "User not found." }); 
  });
});