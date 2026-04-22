import { z } from '../../../shared/lib/zod';

export const LoginDtoSchema = z.object({
  email: z.email().openapi({ example: 'john@example.com' }),
  password: z.string().min(1).openapi({ example: 'secret123' }),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;
