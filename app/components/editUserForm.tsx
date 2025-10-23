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
import type { UserResponse } from '@/types/user';

interface EditUserFormProps {
  user: UserResponse;
}

const EditUserForm = ({ user }: EditUserFormProps) => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<EditUserFormData>({
    resolver: zodResolver(EditUserValidationSchema),
    defaultValues: {
      isLocked: user.isLocked,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: EditUserFormData) => {
      const response = await axiosInstance.patch(`/user/${user.id}`, data, {
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
    mutate(data);
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
