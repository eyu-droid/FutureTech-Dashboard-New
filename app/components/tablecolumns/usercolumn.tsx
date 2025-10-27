'use client';

import type { UserResponse } from '@/types/user';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosinstance';
import { useAuth } from '../authprovider';
import { toastError, toastSuccess } from '@/lib/toast';
import { AxiosError } from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '../ui/dialog';
import EditUserForm from '../editUserForm';

export const columns: ColumnDef<UserResponse>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'isLocked',
    header: 'Is Locked',
  },
  {
    accessorKey: 'isNew',
    header: 'Is New',
  },
  {
    accessorKey: 'Role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.Role;
      return <div>{role ? role.name : 'N/A'}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      const auth = useAuth();
      const queryClient = useQueryClient();

      const { mutate: deleteUser } = useMutation({
        mutationFn: async (id: string) => {
          const response = await axiosInstance.delete(`/user/delete/${id}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          });
          return response.data;
        },
        onSuccess: () => {
          toastSuccess('User deleted successfully');
          queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            toastError(error.response?.data.message);
          }
        },
      });

      return (
        <div className='flex gap-2'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              <EditUserForm user={user} />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='destructive'>Delete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete the selected user?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='outline'>No</Button>
                </DialogClose>
                <Button variant='destructive' onClick={() => deleteUser(user.id)}>
                  Yes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];
