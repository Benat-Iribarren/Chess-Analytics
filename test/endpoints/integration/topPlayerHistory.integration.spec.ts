jest.mock('axios');

import axios, { AxiosError } from 'axios';
import app from '../../../src/index';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Top Player History integration tests', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Returns player history data if both axios calls succeed', async () => {
    const mockLeaderboardData = {
      users: [
        {
          id: 'ediz_gurel',
          username: 'Ediz_Gurel',
          perfs: {
            bullet: {
              rating: 3342,
              progress: 20
            }
          },
          title: 'GM',
          patron: true
        }
      ]
    }

    const mockRatingHistoryData = [
      {
        name: 'Bullet',
        points: [
          [2023, 2, 15, 2846],
          [2023, 2, 16, 2951]
        ]
      },
      {
        name: 'Blitz',
        points: [
          [2025, 2, 15, 2846],
          [2025, 2, 16, 2951]
        ]
      }
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockLeaderboardData });
    mockedAxios.get.mockResolvedValueOnce({ data: mockRatingHistoryData });

    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet&top=1'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      username: 'Ediz_Gurel',
      history: [{ date: '2023-02-15', rating: 2846 }, { date: '2023-02-16', rating: 2951 }]
    });
  });

  it('Returns 400 if mode is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?top=1'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'mode' or 'top' parameter." });
  });
  it('Returns 400 if top is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'mode' or 'top' parameter." });
  });

  it('Returns 400 if top is not a number', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet&top=not_a_number'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'mode' or 'top' parameter." });
  });

  it('Return 400 if top is greater than 200', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet&top=201'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'mode' or 'top' parameter." });
  });

  it('Returns 400 if top is less than 1', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=bullet&top=0'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid or missing 'mode' or 'top' parameter." });
  });

  it('Returns 404 if mode is not found', async () => {
    const error404 = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      response: { status: 404 }
    }) as AxiosError;

    mockedAxios.get.mockRejectedValueOnce(error404);

    const response = await app.inject({
      method: 'GET',
      url: '/chess/topPlayerHistory?mode=this_is_not_a_mode&top=1'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "Game Mode not found." });
  });
});