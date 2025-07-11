import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";
import { usersSchema } from "../utils/schemas";

async function usersRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get<{ Querystring: { id: string } }>('/chess/user', 
        {
            schema: {
              response: usersSchema
            }
          },
        async (request, reply) => {
        
    const { id } = request.query as { id?: string };

    if (!id) {
        return reply.status(400).send({ error: "Invalid or missing 'id' parameter." });
    }
    try {
        const lichessResponse = await axios.get(`https://lichess.org/api/user/${id}`, {
            headers: { 'Accept': 'application/json' }
        });
        
        const { perfs, ...rest } = lichessResponse.data;
        const data = { ...rest, modes: perfs };
        return reply.status(200).send(data);
      } catch (error) {
        fastify.log.error(error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return reply.status(404).send({ error: 'User not found.' });
          }
        return reply.status(500).send({ error: 'Internal server error.' });
      }
    });
  }
  
  export default usersRoute;