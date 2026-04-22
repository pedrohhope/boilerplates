import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './swagger.registry';

// import modules for side effects (registers schemas and paths on the registry)
import '../../modules/users/user.swagger';
import '../../modules/auth/auth.swagger';

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Express API',
    version: '1.0.0',
    description: 'Express + TypeScript + PostgreSQL modular API',
  },
  servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
});
