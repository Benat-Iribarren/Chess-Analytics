import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";


async function enrichedRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get<{ Querystring: { id: string, perf: string } }>('/chess/enriched',
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

    const { id } = request.query as { id?: string };
    const { perf } = request.query as { perf?: string };
    if (!id || !perf) {
        return reply.status(400).send({ error: "Invalid or missing 'id' or 'perf' parameter." });
    }
    try {
        // Petition for user name
        const userInfoResponse = await axios.get(`https://lichess.org/api/user/${id}`, {
            headers: { 'Accept': 'application/json' }
        });
        const userInfo = userInfoResponse.data;
        const username = userInfo.username;

        // Petition for the performance stats of the user
        const userPerformanceResponse = await axios.get(`https://lichess.org/api/user/${username}/perf/${perf}`, {
            headers: { 'Accept': 'application/json' }
        });
        const userPerformance = userPerformanceResponse.data;
        const userResultStreak = {
          wins: {
            current: userPerformance.stat.resultStreak.win.cur.v,
            max: userPerformance.stat.resultStreak.win.max.v,
          },
          losses: {
            current: userPerformance.stat.resultStreak.loss.cur.v,
            max: userPerformance.stat.resultStreak.loss.max.v,
          }
        }
        const data = {
          id: id,
          username: username,
          profile: userInfo.profile,
          playTime: userInfo.playTime,
          rank: userPerformance.rank,
          resultStreak: userResultStreak
        }
        return reply.status(200).send(data);
      } catch (error) {
        fastify.log.error(error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return reply.status(404).send({ error: 'User or Game Mode not found.' });
          }
        return reply.status(500).send({ error: 'Internal server error.' });
      }
    });
  }
  
  export default enrichedRoute;