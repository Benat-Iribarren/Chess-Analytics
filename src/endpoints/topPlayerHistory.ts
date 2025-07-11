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

  const { mode } = request.query as { mode?: string };
  const { top } = request.query as { top?: string };
  if (!mode || !top || parseInt(top) > 200) {
      return reply.status(400).send({ error: "Invalid or missing 'mode' or 'top' parameter." });
  }
  try {
    const leaderboardInfoResponse = await axios.get(`https://lichess.org/api/player/top/${top}/${mode}`, {
        headers: { 'Accept': 'application/json' }
    });
    const leaderboardInfo = leaderboardInfoResponse.data;
    const user = leaderboardInfo.users[parseInt(top) - 1];
    const username = user.username;

    const ratingHistoryResponse = await axios.get(`https://lichess.org/api/user/${username}/rating-history`, {
      headers: { 'Accept': 'application/json' }
    });
    const ratingHistory = ratingHistoryResponse.data;
    
    const history = ratingHistory.find((item: any) => item.name.toLowerCase() === mode);
    const parsedHistory = history.points.map((item: any) => ({
      date: item.slice(0, 3).map((x: any) => String(x).padStart(2, '0')).join('-'),
      rating: item[3]
    }));

    const topPlayerHistoryDataResponse = {
        username: username,
        history: parsedHistory
      }
      return reply.status(200).send(topPlayerHistoryDataResponse);
    } catch (error) {
      fastify.log.error(error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
          return reply.status(404).send({ error: 'Game Mode not found.' });
        }
      return reply.status(500).send({ error: 'Internal server error.' });
    }
  });
}

export default topPlayerHistoryRoute;