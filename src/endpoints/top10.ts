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
        const lichessResponse = await axios.get('https://lichess.org/api/player', {
          headers: { 'Accept': 'application/json' }
        });
        const top10DataResponse = renamePerfsToModes(lichessResponse.data);
        return reply.status(200).send(top10DataResponse);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Internal server error.' });
      }
    });
  }
  function renamePerfsToModes(data: any) {
    const res: any = {};
    for (const mode in data) {
      if (Array.isArray(data[mode])) {
        res[mode] = data[mode].map(player => {
          const { perfs, ...rest } = player;
          return {
            ...rest,
            modes: perfs
          };
        });
      } else {
        res[mode] = data[mode];
      }
    }
    return res;
  }
  export default top10Route;

  