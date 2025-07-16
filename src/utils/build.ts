import Fastify, { fastify, FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

import top10 from "../endpoints/top10";
import users from "../endpoints/user";
import enriched from "../endpoints/enriched";
import topPlayerHistory from "../endpoints/topPlayerHistory";

export function build(opts = {}): FastifyInstance {
    const app = Fastify(opts);
    registerSwagger(app);
    registerSwaggerUI(app);
    registerRoutes(app);
    return app;
}

function registerSwagger(app: FastifyInstance){
    app.register(swagger, {
      swagger: {
        info: {
          title: 'Chess-Analytics',
          version: '1.0.0',
        },
      },
    });
  }
  
  function registerSwaggerUI(app: FastifyInstance){
    app.register(swaggerUI, {
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
  
  function registerRoutes(app: FastifyInstance){
    app.register(top10);
    app.register(users);
    app.register(enriched);
    app.register(topPlayerHistory);
  }
  export   const start = async (fastify: FastifyInstance, PORT: number) => {
    try {
      await fastify.listen({ port: PORT, host: '0.0.0.0' });
      console.log(`Server is running on http://localhost:${PORT}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };