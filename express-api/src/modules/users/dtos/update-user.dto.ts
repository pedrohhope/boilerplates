import { z } from '../../../shared/lib/zod';

export const UpdateUserDtoSchema = z.object({
  name: z.string().min(1).openapi({ example: 'John Doe' }).optional(),
  email: z.email().openapi({ example: 'john@example.com' }).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;
