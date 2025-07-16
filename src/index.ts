import { build, start } from './utils/build';

const fastify = build();

export default fastify;

if (require.main === module) {
  const PORT = 3000;
  start(fastify, PORT);
}
