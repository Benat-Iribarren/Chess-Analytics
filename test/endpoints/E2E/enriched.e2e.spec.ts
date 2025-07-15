import app from '../../../src/index';
import supertest from 'supertest';
import nock from 'nock';
import mockLichessData from '../../mocks/enrichedUserPerformance.json'; 

describe('Top10 E2E tests', () => { 
  let request: any;
  const lichessApiScope = nock('https://lichess.org');
  const userId = 'thibault';
  const mode = 'blitz';

  beforeAll(async () => {
    await app.ready();
    request = supertest(app.server as any);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await app.close();
    nock.restore();
  });

  it('should return 200 with the enriched data if the external API succeeds', async () => {
    
  });
});