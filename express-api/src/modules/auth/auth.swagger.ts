import { z } from '../../shared/lib/zod';
import { registry, ErrorSchema } from '../../shared/swagger/swagger.registry';
import { UserSchema, UserResponseRef } from '../users/user.swagger';
import { RegisterDtoSchema } from './dtos/register.dto';
import { LoginDtoSchema } from './dtos/login.dto';
import { RefreshTokenDtoSchema } from './dtos/refresh-token.dto';

const RegisterDtoRef = registry.register('RegisterDto', RegisterDtoSchema);
const LoginDtoRef = registry.register('LoginDto', LoginDtoSchema);
const RefreshTokenDtoRef = registry.register('RefreshTokenDto', RefreshTokenDtoSchema);

const AuthTokensRef = registry.register(
  'AuthTokens',
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
);

const AuthLoginResponseRef = registry.register(
  'AuthLoginResponse',
  z.object({
    status: z.literal('success'),
    data: z.object({
      user: UserSchema,
      tokens: AuthTokensRef,
    }),
  }).openapi({
    example: {
      status: 'success',
      data: {
        user: { id: 'f44ea1b1-b36e-4181-a3c5-e48e1aa02910', name: 'John Doe', email: 'john@example.com' },
        tokens: { accessToken: '<jwt>', refreshToken: '<jwt>' },
      },
    },
  }),
);

const RefreshResponseRef = registry.register(
  'RefreshResponse',
  z.object({
    status: z.literal('success'),
    data: AuthTokensRef,
  }).openapi({ example: { status: 'success', data: { accessToken: '<jwt>', refreshToken: '<jwt>' } } }),
);

registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: { body: { content: { 'application/json': { schema: RegisterDtoRef } } } },
  responses: {
    201: { description: 'User registered successfully', content: { 'application/json': { schema: AuthLoginResponseRef } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorSchema } } },
    409: { description: 'Email already in use', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  request: { body: { content: { 'application/json': { schema: LoginDtoRef } } } },
  responses: {
    200: { description: 'Login successful', content: { 'application/json': { schema: AuthLoginResponseRef } } },
    401: { description: 'Invalid credentials', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/refresh',
  tags: ['Auth'],
  summary: 'Refresh access token',
  request: { body: { content: { 'application/json': { schema: RefreshTokenDtoRef } } } },
  responses: {
    200: { description: 'Token refreshed', content: { 'application/json': { schema: RefreshResponseRef } } },
    401: { description: 'Invalid or expired refresh token', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  tags: ['Auth'],
  summary: 'Logout and invalidate refresh token',
  request: { body: { content: { 'application/json': { schema: RefreshTokenDtoRef } } } },
  responses: {
    204: { description: 'Logged out successfully' },
    400: { description: 'Bad request', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/logout-all',
  tags: ['Auth'],
  summary: 'Logout from all devices',
  security: [{ bearerAuth: [] }],
  responses: {
    204: { description: 'Logged out from all devices' },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/auth/me',
  tags: ['Auth'],
  summary: 'Get current authenticated user',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Current user data', content: { 'application/json': { schema: UserResponseRef } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
