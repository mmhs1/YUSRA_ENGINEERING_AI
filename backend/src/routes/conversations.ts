import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';

const paramSchema = z.object({
  id: z.string()
});

const messageSchema = z.object({
  content: z.string()
});

export default async function (fastify: FastifyInstance) {
  fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const conversation = await prisma.conversation.create({
        data: {
          userId: request.user.id
        }
      });
      return { conversation };
    } catch (e: any) {
      return reply.code(500).send({ error: { code: 500, message: "Internal server error" } });
    }
  });

  fastify.get('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const conversations = await prisma.conversation.findMany({
        where: { userId: request.user.id },
        orderBy: { updatedAt: 'desc' }
      });
      return { conversations };
    } catch (e: any) {
      return reply.code(500).send({ error: { code: 500, message: "Internal server error" } });
    }
  });
  
  fastify.get('/:id/messages', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const params = paramSchema.parse(request.params);
      const messages = await prisma.message.findMany({
        where: { conversationId: params.id, userId: request.user.id },
        orderBy: { createdAt: 'asc' }
      });
      return { messages };
    } catch (e: any) {
      return reply.code(500).send({ error: { code: 500, message: "Internal server error" } });
    }
  });

  fastify.post('/:id/messages', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const params = paramSchema.parse(request.params);
      const data = messageSchema.parse(request.body);
      
      const conv = await prisma.conversation.findUnique({ where: { id: params.id } });
      if (!conv || conv.userId !== request.user.id) {
         return reply.code(404).send({ error: { code: 404, message: "Conversation not found" } });
      }

      const userMessage = await prisma.message.create({
        data: {
          conversationId: conv.id,
          userId: request.user.id,
          content: data.content,
          role: 'USER'
        }
      });
      
      // Update conv timestamp
      await prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() }});

      return { message: userMessage };
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return reply.code(400).send({ error: { code: 400, message: e.errors } });
      }
      return reply.code(500).send({ error: { code: 500, message: "Internal server error" } });
    }
  });
}
