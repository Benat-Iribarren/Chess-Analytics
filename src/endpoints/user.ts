import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";
import { userSchema } from "../utils/schemas";
import { API_BASE_URL, AXIOS_CONFIG } from "../utils/constants";

export const ERRORS = {
  INVALID_OR_MISSING_ID: 'Invalid or missing \'id\' parameter.',
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  USER_NOT_FOUND: 'User not found.'
};
const BASE_ENDPOINT = '/chess/user';

async function usersRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get<{ Querystring: { id: string } }>(BASE_ENDPOINT, 
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
      const userDataRenamed = renamePerfsToModes(lichessResponseData);

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

function renamePerfsToModes(data: any) {
  const { perfs, ...rest } = data;
  return { ...rest, modes: perfs };
}

function areValidParameters(id: string | undefined) {
  return id;
}

function getInputParameters(request: any) {
  const id = request.query.id as string;
  return { id };
}

export async function getUserResponseData(id: string) {
  const USER_URL = `${API_BASE_URL}/user/${id}`;
  const response = await axios.get(USER_URL, AXIOS_CONFIG);
  return response.data;
}

export default usersRoute;  