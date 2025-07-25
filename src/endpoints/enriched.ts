import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";
import { enrichedSchema } from "../utils/schemas";
import { getUserResponseData } from "./user";
import { API_BASE_URL, AXIOS_CONFIG } from "../utils/constants";

export const ERRORS = {
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  USER_OR_GAME_MODE_NOT_FOUND: 'User or Game Mode not found.',
  INVALID_OR_MISSING_ID_OR_MODE: 'Invalid or missing \'id\' or \'mode\' parameter.'
};

const BASE_ENDPOINT = '/chess/enriched';
async function enrichedRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get<{ Querystring: { id: string, mode: string } }>(BASE_ENDPOINT,
  {
    schema: {
      response: enrichedSchema
    }
  },
  async (request, reply) => {
    const { id, mode } = getInputParameters(request);
    if (!areValidParameters(id, mode)) {
        reply.status(400).send({ error: ERRORS.INVALID_OR_MISSING_ID_OR_MODE });
        return;
    }
    try {
      const userResponseData = await getUserResponseData(id);
      const username = userResponseData.username;

      const userPerformanceResponseData = await getUserPerformanceResponseData(username, mode);
      const userEnrichedData = buildUserEnrichedData(id, username, userResponseData, userPerformanceResponseData);
      
      reply.status(200).send(userEnrichedData);
    } catch (error) {
      fastify.log.error(error);
      if (
        (axios.isAxiosError(error) && error.response?.status === 404) ||
        ((error as any).response?.status === 404)
      ) {
        return reply.status(404).send({ error: ERRORS.USER_OR_GAME_MODE_NOT_FOUND });
      }

      reply.status(500).send({ error: ERRORS.INTERNAL_SERVER_ERROR });
    }
  });
}

function areValidParameters(id: string | undefined, mode: string | undefined) {
    return id && mode;
}

function getInputParameters(request: any) {
  const id = request.query.id as string;
  const mode = request.query.mode as string;
  return { id, mode };
}

async function getUserPerformanceResponseData(username: string, mode: string) {
  const USER_PERF_URL = `${API_BASE_URL}/user/${username}/perf/${mode}`;
  const response = await axios.get(USER_PERF_URL, AXIOS_CONFIG);
  return response.data;
}

function buildUserEnrichedData(id: string, username: string, userInfo: any, userPerformanceResponseData: any) {
  const userResultStreak = {
    wins: {
      current: userPerformanceResponseData.stat.resultStreak.win.cur.v,
      max: userPerformanceResponseData.stat.resultStreak.win.max.v,
    },
    losses: {
      current: userPerformanceResponseData.stat.resultStreak.loss.cur.v,
      max: userPerformanceResponseData.stat.resultStreak.loss.max.v,
    }
  } 
  const enrichedDataResponse = {
    id: id,
    username: username,
    profile: userInfo.profile,
    playTime: userInfo.playTime,
    rank: userPerformanceResponseData.rank != null ? userPerformanceResponseData.rank : null,
    resultStreak: userResultStreak
  }
  return enrichedDataResponse;
}
    
export default enrichedRoute;