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

// Extracted as a proper React component so hooks work correctly
function UserActions({ user }: { user: UserResponse }) {
  const auth = useAuth();
  const queryClient = useQueryClient();

  const { mutate: deleteUser, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/user/delete/${id}`, {
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
        toastError(error.response?.data?.message ?? 'Failed to delete user');
      }
    },
  });

  return (
    <div className='flex gap-2'>
      {/* Edit Dialog */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='destructive' disabled={isPending}>
            {isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The user <strong>{user.email}</strong> will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button
              variant='destructive'
              onClick={() => deleteUser(user.id)}
              disabled={isPending}
            >
              {isPending ? 'Deleting…' : 'Yes, Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
    cell: ({ row }) => (row.original.isLocked ? 'Yes' : 'No'),
  },
  {
    accessorKey: 'isNew',
    header: 'Is New',
    cell: ({ row }) => (row.original.isNew ? 'Yes' : 'No'),
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
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];
