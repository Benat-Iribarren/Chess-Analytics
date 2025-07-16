import { build } from './utils/build';

const fastify = build();

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
