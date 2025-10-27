
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  DeleteRoleValidationSchema,
  type DeleteRoleFormData,
} from '../types/role';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosinstance';
import { toastError, toastSuccess } from '@/lib/toast';
import { AxiosError } from 'axios';
import Loading from './loading';
import { useAuth } from './authprovider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from './ui/dialog';
import { useState } from 'react';
import type { RoleResponse } from '@/types/role';

const DeleteRoleForm = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm<DeleteRoleFormData>({
    resolver: zodResolver(DeleteRoleValidationSchema),
  });

  const { data: roles } = useQuery<RoleResponse[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await axiosInstance.get('/role/getAllRoles', {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      return response.data.data;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: DeleteRoleFormData) => {
      const response = await axiosInstance.delete(`/role/delete/${data.id}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toastSuccess('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setOpen(false);
      setShowConfirmation(false);
      reset();
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toastError(error.response?.data.message);
      }
    },
  });

  const onSubmit: SubmitHandler<DeleteRoleFormData> = () => {
    setShowConfirmation(true);
  };

  const handleDelete = () => {
    const data = getValues();
    mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'destructive'}>Delete Role</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete a Role</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <Label htmlFor="id" className="text-sm text-purple-900">
              Select Role
            </Label>
            <select {...register('id')} className="w-full p-2 border rounded-md">
              {roles && Array.isArray(roles) && roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {errors.id && (
              <span className="text-red-500 text-sm text-sm font-medium">
                {errors.id.message}
              </span>
            )}
          </div>
          <Button variant='destructive' className='w-full' type='submit'>Delete</Button>
        </form>
      </DialogContent>
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Are you sure you want to delete this role?</DialogTitle>
                <DialogDescription>
                    This will permanently delete the role. Are you sure ?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant='outline'>Cancel</Button>
                </DialogClose>
                <Button variant='destructive' onClick={handleDelete} disabled={isPending}>
                    Yes
                    {isPending && <Loading />}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default DeleteRoleForm;
