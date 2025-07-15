jest.mock('axios');

import axios, { AxiosError } from 'axios';
import app from '../../../src/index';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('User integration tests', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Returns data with perfs renamed to modes if axios succeeds', async () => {
    const auxData = {
      games: 3,
      rating: 1688,
      rd: 348,
      prog: 0,
      prov: true
    };
    const data = {
      id: 'thibault',
      username: 'thibault',
      playTime: { total: 1000, tv: 10 },
      perfs: {
        ultrabullet: auxData,
        bullet: auxData,
        blitz: auxData
      }
    };
    const expectedData = {
      id: 'thibault',
      username: 'thibault',
      playTime: { total: 1000, tv: 10 },
      modes: {
        ultrabullet: auxData,
        bullet: auxData,
        blitz: auxData
      }
    };
    mockedAxios.get.mockResolvedValueOnce({ data });

    const response = await app.inject({
      method: 'GET',
      url: '/chess/user?id=thibault'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(expectedData);
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
    const error404 = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      response: { status: 404 }
    }) as AxiosError;

    mockedAxios.get.mockRejectedValueOnce(error404);

    const response = await app.inject({
      method: 'GET',
      url: '/chess/user?id=this_is_not_a_user'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "User not found." });
  });


});
