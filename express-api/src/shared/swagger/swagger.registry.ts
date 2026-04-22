import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from '../lib/zod';

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export const ErrorSchema = registry.register(
  'Error',
  z.object({
    status: z.literal('error'),
    message: z.string(),
  }).openapi({ example: { status: 'error', message: 'Resource not found' } }),
);
