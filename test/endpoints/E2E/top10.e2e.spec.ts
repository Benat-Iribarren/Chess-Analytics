import app from '../../../src/index';
import supertest from 'supertest';


describe('Top10 E2E tests', () => { 
  let request: any;

  beforeAll(async () => {
    await app.ready();
    request = supertest(app.server as any);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Returns 200 and at least one mode in real response', async () => {
    const mode = 'blitz';
    const response = await request.get('/chess/top10');
    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe('object');
    expect(response.body).not.toBeNull();
    expect(
      ['blitz', 'bullet', 'rapid', 'classical', 'ultraBullet', 'crazyhouse', 'chess960', 'kingOfTheHill', 'threeCheck', 'antichess', 'atomic', 'horde', 'racingKings']
        .some((mode) => Array.isArray(response.body[mode]))
    ).toBe(true);
    const firstModePlayer = response.body[mode][0];
    expect(typeof firstModePlayer.id).toBe('string');
    expect(typeof firstModePlayer.username).toBe('string');
    expect(typeof firstModePlayer.modes[mode].rating).toBe('number');
    expect(typeof firstModePlayer.modes[mode].progress).toBe('number');
  });
});