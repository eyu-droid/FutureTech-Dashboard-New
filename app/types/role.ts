import { z } from 'zod';

export const CreateRoleValidationSchema = z.object({
  name: z.string().min(1, { message: 'Role name is required' }),
});

export type CreateRoleFormData = z.infer<typeof CreateRoleValidationSchema>;

export const DeleteRoleValidationSchema = z.object({
    id: z.string(),
});

export type DeleteRoleFormData = z.infer<typeof DeleteRoleValidationSchema>;

export type RoleResponse = {
    id: number;
    name: string;
    createdDate: string;
    updatedAt: string;
}