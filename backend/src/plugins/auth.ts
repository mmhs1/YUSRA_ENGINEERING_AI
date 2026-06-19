import fastifyPlugin from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string, role: string };
    user: { id: string, role: string };
  }
}

export default fastifyPlugin(async function (fastify, opts) {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'super_secret_dev_key_change_in_prod'
  });

  fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: { code: 401, message: "Unauthorized" } });
    }
  });

  fastify.decorate("requireAdmin", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      if (request.user.role !== 'ADMIN') {
        reply.code(403).send({ error: { code: 403, message: "Forbidden" } });
      }
    } catch (err) {
      reply.code(401).send({ error: { code: 401, message: "Unauthorized" } });
    }
  });
});
