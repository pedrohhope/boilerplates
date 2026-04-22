import { z } from '../../../shared/lib/zod';

export const CreateUserDtoSchema = z.object({
  name: z.string().min(1).openapi({ example: 'John Doe' }),
  email: z.email().openapi({ example: 'john@example.com' }),
  password: z.string().min(6).openapi({ example: 'secret123' }),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
