import Fastify from 'fastify';
import cors from '@fastify/cors';
import customJwt from './plugins/auth';
import type { FastifyInstance } from 'fastify';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import conversationRoutes from './routes/conversations';
import mediaRoutes from './routes/media';
import fastifyRateLimit from '@fastify/rate-limit';

const server: FastifyInstance = Fastify({
  logger: true
});

const start = async () => {
  try {
    await server.register(cors);
    await server.register(fastifyRateLimit, {
      max: 100,
      timeWindow: '1 minute'
    });
    
    await server.register(customJwt);

    server.register(authRoutes, { prefix: '/api/v1/auth' });
    server.register(userRoutes, { prefix: '/api/v1/users' });
    server.register(conversationRoutes, { prefix: '/api/v1/conversations' });
    server.register(mediaRoutes, { prefix: '/api/v1/media' });

    server.get('/api/v1/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Backend server running on port ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
