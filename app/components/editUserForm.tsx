import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  EditUserValidationSchema,
  type EditUserFormData,
} from '../types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosinstance';
import { toastError, toastSuccess } from '@/lib/toast';
import { AxiosError } from 'axios';
import Loading from './loading';
import { useAuth } from './authprovider';
import type { UserResponse } from '@/types/user';
import type { RoleResponse } from '@/types/role';
import type { response } from '@/types/response';

interface EditUserFormProps {
  user: UserResponse;
}

const EditUserForm = ({ user }: EditUserFormProps) => {
  const auth = useAuth();
  const queryClient = useQueryClient();

  const { data: roles } = useQuery<response<RoleResponse[]>>({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await axiosInstance.get('/role/getAllRoles', {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      return res.data;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<EditUserFormData>({
    resolver: zodResolver(EditUserValidationSchema),
    defaultValues: {
      isLocked: user.isLocked === 1,
      roleId: user.Role?.id,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: EditUserFormData) => {
      const response = await axiosInstance.patch(`/user/update/${user.id}`, data, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toastSuccess('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toastError(error.response?.data.message);
      }
    },
  });

  const onSubmit: SubmitHandler<EditUserFormData> = (data) => {
    const payload: Partial<EditUserFormData> = {};
    if (data.isLocked !== (user.isLocked === 1)) {
      payload.isLocked = data.isLocked ? 1 : 0;
    }
    
    if (data.roleId !== user.Role?.id) {
      payload.roleId = data.roleId;
    }

    if (Object.keys(payload).length === 0) {
      toastSuccess('No changes to save');
      return;
    }

    mutate(payload as EditUserFormData);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center">
        <Input
          type="checkbox"
          className="w-4 h-4 mr-2"
          {...register('isLocked')}
        />
        <Label htmlFor="isLocked" className="text-sm text-purple-900">
          Is Locked
        </Label>
      </div>
      <div className="space-y-1">
        <Label htmlFor="roleId" className="text-sm text-purple-900">
          Role
        </Label>
        <select
          {...register('roleId')}
          className="w-full p-2 border rounded-md"
        >
          <option value="">None</option>
          {roles?.data?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        className="w-full bg-purple-700 text-white font-semibold hover:bg-purple-500"
        disabled={isPending}
      >
        Update User
        {isPending && <Loading />}
      </Button>
    </form>
  );
};

export default EditUserForm;
