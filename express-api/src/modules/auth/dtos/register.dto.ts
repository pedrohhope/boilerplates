import { z } from '../../../shared/lib/zod';

export const RegisterDtoSchema = z.object({
  name: z.string().min(1).openapi({ example: 'John Doe' }),
  email: z.email().openapi({ example: 'john@example.com' }),
  password: z.string().min(6).openapi({ example: 'secret123' }),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
