import { build } from '../../../src/utils/build';
import { FastifyInstance } from 'fastify';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import mockLichessTop10Data from '../../mocks/top10.mock.json';

const server = setupServer(
  http.get('https://lichess.org/api/player', () => {
    return HttpResponse.json(mockLichessTop10Data);
  })
);

describe('Top10 integration tests', () => {
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

  it('Should return the top 10 players if the external API succeeds', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/chess/top10'
      });
  
      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('bullet');
      expect(body).toHaveProperty('blitz');
      expect(body.bullet[0].id).toBe('ediz_gurel');
      expect(body.bullet[0]).toHaveProperty('modes'); 
    });
  
    it('Should return 500 if the external API fails', async () => {
      server.use(
        http.get('https://lichess.org/api/player', () => {
          return HttpResponse.error();
        })
      );

      const response = await app.inject({
        method: 'GET',
        url: '/chess/top10'
      });
  
      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({ error: 'Internal server error.' });
    });
  });