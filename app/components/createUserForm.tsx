import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  CreateUserValidationSchema,
  type CreateUserFormData,
} from '../types/user';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosinstance';
import { toastError, toastSuccess } from '@/lib/toast';
import { AxiosError } from 'axios';
import Loading from './loading';
import { useAuth } from './authprovider';
import type { RoleResponse } from '@/types/role';
import type { response } from '@/types/response';

const CreateUserForm = () => {
  const auth = useAuth();
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

  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserFormData>({
    resolver: zodResolver(CreateUserValidationSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const response = await axiosInstance.post('/user/createUser', data, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toastSuccess('User created successfully');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toastError(error.response?.data.message);
      }
    },
  });

  const onSubmit: SubmitHandler<CreateUserFormData> = (data) => {
    mutate(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1">
        <Label htmlFor="email" className="text-sm text-purple-900">
          Email
        </Label>
        <Input
          type="email"
          placeholder="Enter email"
          {...register('email')}
        />
        {errors.email && (
          <span className="text-red-500 text-sm font-medium">
            {errors.email.message}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="password" className="text-sm text-purple-900">
          Password
        </Label>
        <Input
          type="password"
          placeholder="Enter password"
          {...register('password')}
        />
        {errors.password && (
          <span className="text-red-500 text-sm font-medium">
            {errors.password.message}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="roleId" className="text-sm text-purple-900">
          Role
        </Label>
        <select {...register('roleId')} className="w-full p-2 border rounded-md">
          <option value="">None</option>
          {roles?.data?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {errors.roleId && (
          <span className="text-red-500 text-sm font-medium">
            {errors.roleId.message}
          </span>
        )}
      </div>
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
      <Button
        type="submit"
        className="w-full bg-purple-700 text-white font-semibold hover:bg-purple-500"
        disabled={isPending}
      >
        Create User
        {isPending && <Loading />}
      </Button>
    </form>
  );
};

export default CreateUserForm;
