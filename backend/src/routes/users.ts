import { FastifyInstance } from 'fastify';
import { prisma } from '../db';

export default async function (fastify: FastifyInstance) {
  fastify.get('/me', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { id: true, email: true, name: true, role: true, createdAt: true }
      });
      if (!user) {
        return reply.code(404).send({ error: { code: 404, message: "User not found" } });
      }
      return { user };
    } catch (e: any) {
      return reply.code(500).send({ error: { code: 500, message: "Internal server error" } });
    }
  });
}
