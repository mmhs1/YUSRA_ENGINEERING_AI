import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as argon2 from 'argon2';
import { prisma } from '../db';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export default async function (fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    try {
      const data = userSchema.parse(request.body);
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        return reply.code(400).send({ error: { code: 400, message: "Email already taken" } });
      }

      const passwordHash = await argon2.hash(data.password);
      const user = await prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name
        }
      });
      
      const token = fastify.jwt.sign({ id: user.id, role: user.role });
      return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return reply.code(400).send({ error: { code: 400, message: e.errors } });
      }
      return reply.code(500).send({ error: { code: 500, message: "Internal server error" } });
    }
  });

  fastify.post('/login', async (request, reply) => {
    try {
      const data = loginSchema.parse(request.body);
      const user = await prisma.user.findUnique({ where: { email: data.email } });
      if (!user) {
        return reply.code(401).send({ error: { code: 401, message: "Invalid credentials" } });
      }

      const isValid = await argon2.verify(user.passwordHash, data.password);
      if (!isValid) {
        return reply.code(401).send({ error: { code: 401, message: "Invalid credentials" } });
      }

      const token = fastify.jwt.sign({ id: user.id, role: user.role });
      return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return reply.code(400).send({ error: { code: 400, message: e.errors } });
      }
      return reply.code(500).send({ error: { code: 500, message: "Internal server error" } });
    }
  });
}
