import app from '../../../src/index';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Top10 integration tests', () => {
    beforeAll(async () => {
      await app.ready();
    });
  
    afterAll(async () => {
      await app.close();
    });
  
    it('Returns data if axios succeeds', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { top10: [] } });
  
      const response = await app.inject({
        method: 'GET',
        url: '/chess/top10'
      });
  
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ top10: [] });
    });
  
    it('Returns 500 if axios fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API down'));
  
      const response = await app.inject({
        method: 'GET',
        url: '/chess/top10'
      });
  
      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({ error: 'Internal server error.' });
    });
  });