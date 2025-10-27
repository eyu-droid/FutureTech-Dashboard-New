
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  CreateRoleValidationSchema,
  type CreateRoleFormData,
} from '../types/role';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosinstance';
import { toastError, toastSuccess } from '@/lib/toast';
import { AxiosError } from 'axios';
import Loading from './loading';
import { useAuth } from './authprovider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useState } from 'react';

const CreateRoleForm = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateRoleFormData>({
    resolver: zodResolver(CreateRoleValidationSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreateRoleFormData) => {
      const response = await axiosInstance.post('/role/createRole', data, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toastSuccess('Role created successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setOpen(false);
      reset();
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toastError(error.response?.data.message);
      }
    },
  });

  const onSubmit: SubmitHandler<CreateRoleFormData> = (data) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Role</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>A New Role</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm text-purple-900">
              Role Name
            </Label>
            <Input
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
            Create a role
            {isPending && <Loading />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleForm;
