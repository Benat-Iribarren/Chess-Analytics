import { build } from '../../../src/utils/build';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FastifyInstance } from 'fastify';
import mockLichessUserData from '../../mocks/user-thibault.mock.json';
import { ERRORS } from '../../../src/endpoints/user';

const USER_ID = 'thibault';
const LICHESS_API_USER_URL = `https://lichess.org/api/user/${USER_ID}`;

const server = setupServer(
  http.get(LICHESS_API_USER_URL, () => {
    return HttpResponse.json(mockLichessUserData);
  })
);

describe('User E2E tests', () => { 
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
    
  const API_USER_ENDPOINT = '/chess/user';
  it('Should return 200 and complete user info for a valid user id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: API_USER_ENDPOINT,
      query: { id: USER_ID }
    });
    
    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.id).toBe(USER_ID);
    expect(body.username).toBe('thibault');
    // ... el resto de assertions
  });

  it('Should return 500 if the external Lichess API fails', async () => {
    server.use(
      http.get(LICHESS_API_USER_URL, () => {
        return HttpResponse.error();
      })
    );

    const response = await app.inject({
      method: 'GET',
      url: API_USER_ENDPOINT,
      query: { id: USER_ID }
    });
    
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });
});