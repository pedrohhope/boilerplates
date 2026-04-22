import { z } from '../../shared/lib/zod';
import { registry, ErrorSchema } from '../../shared/swagger/swagger.registry';
import { CreateUserDtoSchema } from './dtos/create-user.dto';
import { UpdateUserDtoSchema } from './dtos/update-user.dto';

export const UserSchema = z.object({
  id: z.string().uuid().openapi({ example: 'f44ea1b1-b36e-4181-a3c5-e48e1aa02910' }),
  name: z.string().openapi({ example: 'John Doe' }),
  email: z.string().openapi({ example: 'john@example.com' }),
  is_active: z.boolean().openapi({ example: true }),
  created_at: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  updated_at: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
});

export const UserResponseRef = registry.register(
  'UserResponse',
  z.object({
    status: z.literal('success'),
    data: UserSchema,
  }).openapi({
    example: {
      status: 'success',
      data: {
        id: 'f44ea1b1-b36e-4181-a3c5-e48e1aa02910',
        name: 'John Doe',
        email: 'john@example.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
    },
  }),
);

const UserListResponseRef = registry.register(
  'UserListResponse',
  z.object({
    status: z.literal('success'),
    data: z.array(UserSchema),
  }),
);

const CreateUserDtoRef = registry.register('CreateUserDto', CreateUserDtoSchema);
const UpdateUserDtoRef = registry.register('UpdateUserDto', UpdateUserDtoSchema);

registry.registerPath({
  method: 'get',
  path: '/api/users',
  tags: ['Users'],
  summary: 'List all users',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'List of users', content: { 'application/json': { schema: UserListResponseRef } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Get user by ID',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: 'User found', content: { 'application/json': { schema: UserResponseRef } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/users',
  tags: ['Users'],
  summary: 'Create a new user',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: CreateUserDtoRef } } } },
  responses: {
    201: { description: 'User created', content: { 'application/json': { schema: UserResponseRef } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
    409: { description: 'Email already in use', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Update user',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { 'application/json': { schema: UpdateUserDtoRef } } },
  },
  responses: {
    200: { description: 'User updated', content: { 'application/json': { schema: UserResponseRef } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
    409: { description: 'Email already in use', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Delete user',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    204: { description: 'User deleted' },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
