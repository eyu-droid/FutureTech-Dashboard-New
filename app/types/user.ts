import { z } from 'zod';

export interface UserResponse {
  id: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  isLocked: boolean;
  isNew: boolean;
}

export const CreateUserValidationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long',
  }),
  isLocked: z.boolean(),
  role: z.enum(['Admin', 'User']),
});

export type CreateUserFormData = z.infer<typeof CreateUserValidationSchema>;

export const EditUserValidationSchema = z.object({
  isLocked: z.boolean(),
});

export type EditUserFormData = z.infer<typeof EditUserValidationSchema>;
