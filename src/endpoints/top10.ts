import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";
import { top10Schema } from "../utils/schemas";
import { LichessLeaderboardResponse } from "../utils/types";

const API_BASE_URL = 'https://lichess.org/api';
const AXIOS_CONFIG = {
  headers: { 'Accept': 'application/json' }
};
const ERRORS = {
  INTERNAL_SERVER_ERROR: 'Internal server error.'
};
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
      reply.status(500).send({ error: ERRORS.INTERNAL_SERVER_ERROR });
    }
  });
}

async function getLeaderboardResponseData() {
  const response = await axios.get(`${API_BASE_URL}/player`, AXIOS_CONFIG);
  return response.data;
}

function renamePerfsNameToModes(data: LichessLeaderboardResponse) {
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