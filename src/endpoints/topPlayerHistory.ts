import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";
import { topPlayerHistorySchema } from "../utils/schemas";

const API_BASE_URL = 'https://lichess.org/api';
const AXIOS_CONFIG = {
  headers: { 'Accept': 'application/json' }
};
const ERRORS = {
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  GAME_MODE_NOT_FOUND: 'Game Mode not found.',
  USER_NOT_FOUND: 'User not found.',
  INVALID_OR_MISSING_MODE_OR_TOP: 'Invalid or missing \'mode\' or \'top\' parameter.'
};


async function topPlayerHistoryRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get<{ Querystring: { mode: string, top: string } }>('/chess/topPlayerHistory',
  {
    schema: {
      response: topPlayerHistorySchema
    }
  },
  async (request, reply) => {

    const { mode, top } = getInputParameters(request);
    if (!areValidParameters(mode, top)) {
      reply.status(400).send({ error: ERRORS.INVALID_OR_MISSING_MODE_OR_TOP });
      return;
    }
    try {
      const leaderboardInfoData = await getLeaderboardInfoResponseData(top, mode);
      const user = leaderboardInfoData.users[parseInt(top) - 1];
      if (!user) {
        reply.status(404).send({ error: ERRORS.USER_NOT_FOUND });
        return;
      }
      const username = user.username;

      const ratingHistoryData = await getRatingHistoryResponseData(username);
      const history = getRatingHistoryDataFromMode(ratingHistoryData, mode);
      const parsedHistory = parseHistoryDataToObject(history);

      const playerHistoryData = buildPlayerHistoryData(username, parsedHistory)

      reply.status(200).send(playerHistoryData);
    } catch (error) {
      fastify.log.error(error);
      if (
        (axios.isAxiosError(error) && error.response?.status === 404) ||
        ((error as any).response?.status === 404)
      ) {
        return reply.status(404).send({ error: ERRORS.GAME_MODE_NOT_FOUND });
      }

      reply.status(500).send({ error: ERRORS.INTERNAL_SERVER_ERROR });
    }
  });
}

function buildPlayerHistoryData(username: any, parsedHistory: any) {
  return {
    username: username,
    history: parsedHistory
  };
}

function getRatingHistoryDataFromMode(ratingHistoryData: any, mode: string) {
  return ratingHistoryData.find((item: any) => item.name.toLowerCase() === mode);
}

function parseHistoryDataToObject(history: any) {
  return history.points.map((item: any) => ({
    date: parseDateValuesToString(item),
    rating: item[3]
  }));
}

function parseDateValuesToString(dateArray: any[]): string {
  return dateArray.slice(0, 3).map((x: any) => String(x).padStart(2, '0')).join('-');
}

function areValidParameters(mode: string | undefined, top: string | undefined) {
  return mode && top && parseInt(top) <= 200 && parseInt(top) > 0;
}

function getInputParameters(request: any) {
  const mode = request.query.mode as string;
  const top = request.query.top as string;
  return { mode, top };
}

async function getLeaderboardInfoResponseData(top: string, mode: string) {
  const response = await axios.get(`${API_BASE_URL}/player/top/${top}/${mode}`, AXIOS_CONFIG);
  return response.data;
}

async function getRatingHistoryResponseData(username: string) {
  const response = await axios.get(`${API_BASE_URL}/user/${username}/rating-history`, AXIOS_CONFIG);
  return response.data;
}

export default topPlayerHistoryRoute;