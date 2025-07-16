import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";
import { userSchema } from "../utils/schemas";

const API_BASE_URL = 'https://lichess.org/api';
const AXIOS_CONFIG = {
  headers: { 'Accept': 'application/json' }
};
const ERRORS = {
  INVALID_OR_MISSING_ID: 'Invalid or missing \'id\' parameter.',
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  USER_NOT_FOUND: 'User not found.'
};

async function usersRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get<{ Querystring: { id: string } }>('/chess/user', 
  {
    schema: {
      response: userSchema
    }
  },
  async (request, reply) => {
    const { id } = getInputParameters(request);
    if (!areValidParameters(id)) {
      reply.status(400).send({ error: ERRORS.INVALID_OR_MISSING_ID });
      return;
    }
    try {
      const lichessResponseData = await getUserResponseData(id);
      const { perfs, ...rest } = lichessResponseData;
      const userDataRenamed = { ...rest, modes: perfs };

      reply.status(200).send(userDataRenamed);
    } catch (error) {
      fastify.log.error(error);
      if (
        (axios.isAxiosError(error) && error.response?.status === 404) ||
        ((error as any).response?.status === 404)
      ) {
        return reply.status(404).send({ error: ERRORS.USER_NOT_FOUND });
      }

      reply.status(500).send({ error: ERRORS.INTERNAL_SERVER_ERROR });
    }
  });
}

function areValidParameters(id: string | undefined) {
  return id;
}

function getInputParameters(request: any) {
  const id = request.query.id as string;
  return { id };
}

export async function getUserResponseData(id: string) {
  const response = await axios.get(`${API_BASE_URL}/user/${id}`, AXIOS_CONFIG);
  return response.data;
}

export default usersRoute;  