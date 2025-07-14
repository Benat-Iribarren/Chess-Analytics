import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

import top10 from './endpoints/top10';
import users from './endpoints/user';
import enriched from './endpoints/enriched';
import topPlayerHistory from './endpoints/topPlayerHistory';

const fastify = Fastify({ logger: process.env.NODE_ENV !== 'test' });

registerSwagger();
registerSwaggerUI();
registerRoutes();

export default fastify;

if (require.main === module) {
  const PORT = 3000;

  const start = async () => {
    try {
      await fastify.listen({ port: PORT, host: '0.0.0.0' });
      console.log(`Server is running on http://localhost:${PORT}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  start();
}

function registerSwagger(){
  fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Chess-Analytics',
        version: '1.0.0',
      },
    },
  });
}

function registerSwaggerUI(){
  fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    staticCSP: true,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true
  });
}

function registerRoutes(){
  fastify.register(top10);
  fastify.register(users);
  fastify.register(enriched);
  fastify.register(topPlayerHistory);
}