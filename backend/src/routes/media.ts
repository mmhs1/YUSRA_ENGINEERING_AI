import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';
import crypto from 'crypto';

const uploadRequestSchema = z.object({
  filename: z.string(),
  contentType: z.string()
});

const uploadCompleteSchema = z.object({
  url: z.string(),
  type: z.string(),
  messageId: z.string()
});

export default async function (fastify: FastifyInstance) {
  fastify.post('/request-upload', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const data = uploadRequestSchema.parse(request.body);
      // Generate a mock signed URL since S3 implementation happens in Phase 5
      const uploadId = crypto.randomUUID();
      const signedUrl = `https://mock-s3.example.com/upload/${uploadId}?signature=mock123`;
      return { uploadUrl: signedUrl, uploadId };
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return reply.code(400).send({ error: { code: 400, message: e.errors } });
      }
      return reply.code(500).send({ error: { code: 500, message: "Internal server error" } });
    }
  });

  fastify.post('/complete-upload', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const data = uploadCompleteSchema.parse(request.body);
      const media = await prisma.media.create({
        data: {
          url: data.url,
          type: data.type,
          messageId: data.messageId
        }
      });
      return { media };
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return reply.code(400).send({ error: { code: 400, message: e.errors } });
      }
      return reply.code(500).send({ error: { code: 500, message: "Internal server error" } });
    }
  });
}
