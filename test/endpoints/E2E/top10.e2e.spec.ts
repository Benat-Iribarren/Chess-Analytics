import supertest from 'supertest';
import { build } from '../../../src/utils/build';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FastifyInstance } from 'fastify';
import mockLichessTop10Data from '../../mocks/top10.mock.json'; 
import { ERRORS } from '../../../src/endpoints/top10';

const server = setupServer(
  http.get('https://lichess.org/api/player', () => {
    return HttpResponse.json(mockLichessTop10Data);
  })
);

describe('Top10 E2E tests', () => { 
  let app: FastifyInstance;
  let request: any;

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

  it('Should return 200 with a structured list of top players', async () => {
    const response = await request.get('/chess/top10');

    expect(response.statusCode).toBe(200);
    
    const body = response.body;
    expect(body).toHaveProperty('bullet');

    const firstBulletPlayer = body.bullet[0];
    expect(firstBulletPlayer.id).toBe('ediz_gurel');
    expect(firstBulletPlayer).not.toHaveProperty('perfs');
    expect(firstBulletPlayer).toHaveProperty('modes');
    expect(firstBulletPlayer.modes.bullet.rating).toBe(3371);

    const secondBlitzPlayer = body.blitz[1];
    expect(secondBlitzPlayer.id).toBe('iammatecheckmate');
    expect(secondBlitzPlayer.modes.blitz.rating).toBe(3031);

    const thirdBulletPlayer = body.bullet[2];
    expect(thirdBulletPlayer.id).toBe('heisenberg01');
    expect(thirdBulletPlayer.modes.bullet.rating).toBe(3235);
    expect(thirdBulletPlayer.modes.bullet.progress).toBe(26);
    expect(thirdBulletPlayer.title).toBe('FM');
  });

  it('Should return 500 if the external API fails', async () => {
    server.use(
      http.get('https://lichess.org/api/player', () => {
        return HttpResponse.error();
      })
    );

    const response = await request.get('/chess/top10');
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: ERRORS.INTERNAL_SERVER_ERROR });
  });
});