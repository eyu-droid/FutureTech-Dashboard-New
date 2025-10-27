import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  EditUserValidationSchema,
  type EditUserFormData,
} from '../types/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosinstance';
import { toastError, toastSuccess } from '@/lib/toast';
import { AxiosError } from 'axios';
import Loading from './loading';
import { useAuth } from './authprovider';
import type { RoleResponse } from '@/types/role';
import * as z from 'zod';

export const EditRoleValidationSchema = z.object({
  name: z.string().min(1, { message: 'Role name is required' }),
});

export type EditRoleFormData = z.infer<typeof EditRoleValidationSchema>

interface EditRoleFormProps {
  role: RoleResponse;
}

const EditRoleForm = ({ role }: EditRoleFormProps) => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<EditRoleFormData>({
    resolver: zodResolver(EditRoleValidationSchema),
    defaultValues: {
      name: role.name,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: EditRoleFormData) => {
      const response = await axiosInstance.patch(`/role/update/${role.id}`, data, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toastSuccess('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toastError(error.response?.data.message);
      }
    },
  });

  const onSubmit: SubmitHandler<EditUserFormData> = (data) => {
    mutate(data);
  };

  return (
     <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
         <div className="space-y-1">
             <Label htmlFor="name" className="text-sm text-purple-900">
             Edit a role
             </Label>
             <Input
             type="text"
             placeholder="Enter role name"
             {...register('name')}
             />
             {errors.name && (
             <span className="text-red-500 text-sm font-medium">
                 {errors.name.message}
             </span>
             )}
         </div>
         <Button
             type="submit"
             className="w-full bg-purple-700 text-white font-semibold hover:bg-purple-500"
             disabled={isPending}
         >
             Update a Role
             {isPending && <Loading />}
         </Button>
     </form>
   );
 };

export default EditRoleForm;
