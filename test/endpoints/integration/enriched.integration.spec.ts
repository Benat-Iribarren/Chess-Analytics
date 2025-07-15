jest.mock('axios');

import axios, { AxiosError } from 'axios';
import app from '../../../src/index';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Enriched integration tests', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Returns enriched data if both axios calls succeed', async () => {
    const mockUserData = {
      id: 'thibault',
      username: 'thibault',
      profile: {
        bio: 'I turn coffee into bugs.',
        realName: 'Thibault Duplessis',
        links: 'github.com/ornicar\r\nmas.to/@thibault'
      },
      playTime: {
        total: 6408249,
        tv: 17974
      }
    };

    const mockPerfData = {
      rank: null,
      stat: {
        resultStreak: {
          win: { cur: { v: 0 }, max: { v: 16 } },
          loss: { cur: { v: 1 }, max: { v: 14 } }
        }
      }
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockUserData });
    mockedAxios.get.mockResolvedValueOnce({ data: mockPerfData });

    const response = await app.inject({
      method: 'GET',
      url: '/chess/enriched?id=thibault&mode=blitz'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: 'thibault',
      username: 'thibault',
      profile: {
        bio: 'I turn coffee into bugs.',
        realName: 'Thibault Duplessis',
        links: 'github.com/ornicar\r\nmas.to/@thibault'
      },
      playTime: {
        total: 6408249,
        tv: 17974
      },
      rank: null,
      resultStreak: {
        wins: {
          current: 0,
          max: 16
        },
        losses: {
          current: 1,
          max: 14
        }
      }
    });
  });

  it('Returns 400 if mode is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/enriched?id=thibault'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'id' or 'mode' parameter." });
  });

  it('Returns 400 if id is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/enriched?mode=blitz'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'id' or 'mode' parameter." });
  });

  it('Returns 404 if user is not found', async () => {
    const error404 = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      response: { status: 404 }
    }) as AxiosError;

    mockedAxios.get.mockRejectedValueOnce(error404);

    const response = await app.inject({
      method: 'GET',
      url: '/chess/enriched?id=this_is_not_a_user&mode=blitz'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "User or Game Mode not found." });
  });

  it('Returns 404 if mode is not found', async () => {
    const error404 = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      response: { status: 404 }
    }) as AxiosError;

    mockedAxios.get.mockResolvedValueOnce({ data: { username: 'thibault' } });
    mockedAxios.get.mockRejectedValueOnce(error404);

    const response = await app.inject({
      method: 'GET',
      url: '/chess/enriched?id=thibault&mode=this_is_not_a_mode'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "User or Game Mode not found." });
  });
});