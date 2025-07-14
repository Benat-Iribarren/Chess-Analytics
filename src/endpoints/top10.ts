import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";
import { top10Schema } from "../utils/schemas";

async function top10Route(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get('/chess/top10',
  {
    schema: {
      response: top10Schema
    }
  },
  async (request, reply) => {
    try {
      const leaderboardResponseData = await getLeaderboardResponseData();
      const top10DataRenamed = renamePerfsNameToModes(leaderboardResponseData);

      reply.status(200).send(top10DataRenamed);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Internal server error.' });
    }
  });
}

async function getLeaderboardResponseData() {
  const response = await axios.get('https://lichess.org/api/player', {
    headers: { 'Accept': 'application/json' }
  });
  return response.data;
}

function renamePerfsNameToModes(data: any) {
  const res: any = {};
  for (const mode in data) {
    if (Array.isArray(data[mode])) {
      res[mode] = data[mode].map(player => {
        const { perfs, ...rest } = player;
        return perfs !== undefined
          ? { ...rest, modes: perfs }
          : { ...rest }; 
      });
    } else {
      res[mode] = data[mode];
    }
  }
  return res;
}
export default top10Route;