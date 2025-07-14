import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";
import { userSchema } from "../utils/schemas";


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
      reply.status(400).send({ error: "Invalid or missing 'id' parameter." });
      return;
    }
    try {
      const lichessResponseData = await getUserResponseData(id);
      const { perfs, ...rest } = lichessResponseData;
      const userDataRenamed = { ...rest, modes: perfs };

      reply.status(200).send(userDataRenamed);
    } catch (error) {
      fastify.log.error(error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        reply.status(404).send({ error: 'User not found.' });
        return;
      }

      reply.status(500).send({ error: 'Internal server error.' });
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
  const response = await axios.get(`https://lichess.org/api/user/${id}`, {
    headers: { 'Accept': 'application/json' }
  });
  return response.data;
}

export default usersRoute;  