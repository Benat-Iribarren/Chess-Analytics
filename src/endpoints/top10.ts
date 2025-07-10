import { FastifyInstance, FastifyPluginOptions } from "fastify";
import axios from "axios";

async function top10Route(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get('/chess/top10', async (request, reply) => {
      try {
        const lichessResponse = await axios.get('https://lichess.org/api/player', {
          headers: { 'Accept': 'application/json' }
        });
        return lichessResponse.data;
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Internal server error.' });
      }
    });
  }
  
  export default top10Route;