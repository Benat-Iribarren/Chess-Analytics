import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";
import { top10Schema } from "../utils/schemas";
import { LichessLeaderboardResponse } from "../utils/types";
import { API_BASE_URL, AXIOS_CONFIG } from "../utils/constants";

export const ERRORS = {
  INTERNAL_SERVER_ERROR: 'Internal server error.'
};

const BASE_ENDPOINT = '/chess/top10';
async function top10Route(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get(BASE_ENDPOINT,
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
  const LEADERBOARD_URL = `${API_BASE_URL}/player`;
  const response = await axios.get(LEADERBOARD_URL, AXIOS_CONFIG);
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