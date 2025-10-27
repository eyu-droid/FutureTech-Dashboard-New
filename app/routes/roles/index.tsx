import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/authprovider';
import axiosInstance from '@/lib/axiosinstance';
import { toastError } from '@/lib/toast';
import { Input } from '@/components/ui/input';
import Loading from '@/components/loading';
import type { response } from '@/types/response';
import { useDebounce } from '@/hooks/debounce';
import { AxiosError } from 'axios';
import RolesTable from '@/components/rolestable';
import { columns } from '@/components/tablecolumns/rolecolumn';

export function meta() {
  return [
    { title: 'Roles - Future Tech Addis' },
    { name: 'description', content: 'Roles page' },
  ];
}

export default function RolesPage() {
  const auth = useAuth();
  const [filter, setFilter] = useState<string>('');
  const debounceSearchTerm = useDebounce(filter, 500);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['roles', debounceSearchTerm],
    queryFn: async () => {

      const res = await axiosInstance.get<response<any[]>>(
        `/role/getAllRoles?query=${debounceSearchTerm}`,
        {
          headers: {
            Authorization: `Bearer ` + auth?.token,
          },
        }
      );
      return res.data;
    },
  });

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-2xl">Roles</h3>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name..."
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      {isLoading && <Loading />}
      <RolesTable columns={columns} data={data?.data} />
    </div>
  );
}
