import { build } from '../../../src/utils/build';
import { FastifyInstance } from 'fastify';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import mockLichessUserData from '../../mocks/user-thibault.mock.json';
import { ERRORS } from '../../../src/endpoints/user';

const USER_ID = 'thibault';
const USER_URL = `https://lichess.org/api/user/${USER_ID}`;

const server = setupServer(
  http.get(USER_URL, () => {
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

  const USER_URL_ENDPOINT = '/chess/user';

  it('Should return the user data if the external API succeeds', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `${USER_URL_ENDPOINT}?id=${USER_ID}`
    });

    const body = response.json();
    expect(body.id).toBe('thibault');
    expect(body.username).toBe('thibault');
    expect(body).toHaveProperty('modes');
    expect(body.modes.blitz.games).toBe(11470);
  });

  it('Should return 400 if id is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: USER_URL_ENDPOINT
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: ERRORS.INVALID_OR_MISSING_ID });
  });

  it('Should return 404 if user is not found', async () => {
    const LICHESS_API_URL = `https://lichess.org/api/user/this_is_not_a_user`;
    server.use(
      http.get(LICHESS_API_URL, () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: `${USER_URL_ENDPOINT}?id=this_is_not_a_user`
    });

    expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: ERRORS.USER_NOT_FOUND });
  });


});
