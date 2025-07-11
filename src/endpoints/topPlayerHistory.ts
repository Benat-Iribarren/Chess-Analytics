import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";


async function topPlayerHistoryRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get<{ Querystring: { id: string, perf: string } }>('/chess/topPlayerHistory',
       {schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              profile: { type: 'object', additionalProperties: true },
              playTime: { type: 'object', additionalProperties: true },
              rank: { type: 'string' },
              resultStreak: { type: 'object', additionalProperties: true }
            }
          }
        }
       }
       }
      ,async (request, reply) => {

    const { mode } = request.query as { mode?: string };
    const { top } = request.query as { top?: string };
    if (!mode || !top || parseInt(top) > 10) {
        return reply.status(400).send({ error: "Invalid or missing 'mode' or 'top' parameter." });
    }
    try {
        // Petition for game mode leaderboard
        const leaderboardInfoResponse = await axios.get(`https://lichess.org/api/top/10/${mode}`, {
            headers: { 'Accept': 'application/json' }
        });
        const leaderboardInfo = leaderboardInfoResponse.data;
        console.log(leaderboardInfo);
        const userList = leaderboardInfo.users;

        const data = {
        }
        return reply.status(200).send(leaderboardInfo);
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