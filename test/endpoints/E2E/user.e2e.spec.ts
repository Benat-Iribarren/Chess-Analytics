import { build } from '../../../src/utils/build';
import supertest from 'supertest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FastifyInstance } from 'fastify';
import mockLichessUserData from '../../mocks/user-thibault.mock.json';

const server = setupServer(
  http.get('https://lichess.org/api/user/thibault', () => {
    return HttpResponse.json(mockLichessUserData);
  })
);

describe('User E2E tests', () => { 
  let app: FastifyInstance;
  let request: any;
  const userId = 'thibault';

  
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
    
  it('Returns 200 and complete user info for a valid user id', async () => {
    const response = await request.get(`/chess/user?id=${userId}`);
    expect(response.statusCode).toBe(200);

    const body = response.body;
    expect(body.id).toBe(userId);
    expect(body.username).toBe('thibault');
    expect(body.playTime.total).toBe(6408249);
    expect(body.playTime.tv).toBe(17974);

    expect(body).not.toHaveProperty('perfs');
    expect(body).toHaveProperty('modes');

    expect(body.modes.blitz.games).toBe(11470);
    expect(body.modes.puzzle.rating).toBe(1940);
    expect(body.modes.classical.rd).toBe(242);
    expect(body.modes.bullet.prog).toBe(-26);
    expect(body.modes.ultraBullet.prov).toBe(true);

    expect(body.profile.bio).toBe('I turn coffee into bugs.');
    expect(body.profile.realName).toBe('Thibault Duplessis');
    expect(body.profile.links).toBe('github.com/ornicar\r\nmas.to/@thibault');
    expect(body.flair).toBe('nature.seedling');
    expect(body.patron).toBe(true);
    expect(body.verified).toBe(true);
    expect(body.createdAt).toBe(1290415680000);
    expect(body.seenAt).toBe(1752475985759);

  });

  it('Returns 500 if the external Lichess API fails', async () => {
    server.use(
      http.get('https://lichess.org/api/user/thibault', () => {
        return HttpResponse.error();
      })
    );

    const response = await request.get(`/chess/user?id=${userId}`);
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error.' });
  });
});
