import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";
import { topPlayerHistorySchema } from "../utils/schemas";

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
      reply.status(400).send({ error: "Invalid or missing 'mode' or 'top' parameter." });
      return;
    }
    try {
      const leaderboardInfoData = await getLeaderboardInfoResponseData(top, mode);
      const user = leaderboardInfoData.users[parseInt(top) - 1];
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
        return reply.status(404).send({ error: 'Game Mode not found.' });
      }

      reply.status(500).send({ error: 'Internal server error.' });
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
  const response = await axios.get(`https://lichess.org/api/player/top/${top}/${mode}`, {
    headers: { 'Accept': 'application/json' }
  });
  return response.data;
}

async function getRatingHistoryResponseData(username: string) {
  const response = await axios.get(`https://lichess.org/api/user/${username}/rating-history`, {
    headers: { 'Accept': 'application/json' }
  });
  return response.data;
}

export default topPlayerHistoryRoute;