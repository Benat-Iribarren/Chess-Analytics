import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";


async function usersRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Pasar el id como query param
    fastify.get<{ Querystring: { id: string } }>('/chess/user', 
        {
            schema: {
              response: {
                200: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    username: { type: 'string' },
                    perfs: { type: 'object', additionalProperties: true },
                    flair: { type: 'string' },
                    patron: { type: 'boolean' },
                    verified: { type: 'boolean' },
                    createdAt: { type: 'number' },
                    profile: { type: 'object', additionalProperties: true },
                    seenAt: { type: 'number' },
                    playTime: { type: 'object', additionalProperties: true }
                  },
                  required: ['id', 'username', 'perfs', 'createdAt']
                }
              }
            }
          },
        async (request, reply) => {
        
    // Leer el id del usuario desde la query
    const { id } = request.query as { id?: string };

    if (!id) {
        return reply.status(400).send({ error: "Invalid or missing 'id' parameter." });
    }
    try {
        // Hacer la petición a la API de Lichess
        const lichessResponse = await axios.get(`https://lichess.org/api/user/${id}`, {
            headers: { 'Accept': 'application/json' }
        });
        
        // Devolver la respuesta de la API de Lichess
        return lichessResponse.data;
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