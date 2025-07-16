import { build } from '../../../src/utils/build';
import { FastifyInstance } from 'fastify';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import mockLichessUserData from '../../mocks/user-thibault.mock.json';

const server = setupServer(
  http.get('https://lichess.org/api/user/thibault', () => {
    return HttpResponse.json(mockLichessUserData);
  })
);


describe('User integration tests', () => {
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

  it('Returns data with perfs renamed to modes if axios succeeds', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/user?id=thibault'
    });

    const body = response.json();
    expect(body.id).toBe('thibault');
    expect(body.username).toBe('thibault');
    expect(body).toHaveProperty('modes');
    expect(body.modes.blitz.games).toBe(11470);
  });

  it('Returns 400 if id is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/user'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'id' parameter." });
  });

  it('Returns 404 if user is not found', async () => {
    server.use(
      http.get('https://lichess.org/api/user/this_is_not_a_user', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: '/chess/user?id=this_is_not_a_user'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "User not found." });
  });


});
