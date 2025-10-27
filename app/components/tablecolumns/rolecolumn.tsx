'use client';

import type { ColumnDef } from '@tanstack/react-table';


import { Button } from '../ui/button';
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

import EditRoleForm from '../editRoleForm';
import type { RoleResponse } from '@/types/role';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosinstance';
import { toastError, toastSuccess } from '@/lib/toast';
import { AxiosError } from 'axios';
import { useAuth } from '../authprovider';


export const columns: ColumnDef<RoleResponse>[] = [
  {
    accessorKey: 'id',
    header: 'Role Id',
  },
  {
    accessorKey: 'name',
    header: 'Role Name',
  },
  {
    accessorKey: 'createdDate',
    header: 'Created At',
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
        const role = row.original;
        const auth = useAuth();
        const queryClient = useQueryClient();
        const { mutate } = useMutation({
            mutationFn: async () => {
                const response = await axiosInstance.delete(`/role/deleteRole/${role.id}`, {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                });
                return response.data;
            },
            onSuccess: () => {
                toastSuccess('Role deleted successfully');
                queryClient.invalidateQueries({ queryKey: ['roles'] });
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
                <DialogTitle>Edit Role</DialogTitle>
              </DialogHeader>
              <EditRoleForm role={role} />
            </DialogContent>
          </Dialog>
              </div>
      );
    },
  },
];
