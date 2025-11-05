import type { ColumnDef } from "@tanstack/react-table";
import { columns } from "./submissioncolumns";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Loading from "../loading";
import { ArrowUpDown, MoreVertical, Plus } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import FollowUp from "../followup";
import axiosInstance from "@/lib/axiosinstance";
import type { response } from "@/types/response";
import type { FollowUpListType } from "@/types/followup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../authprovider";
import { useEffect, useState } from "react";
import { BaseColumns } from "./basecolumns";
import SubmissionDetail from "@/components/submissiondetails/submissionDetails";
import type { EmbassySubmission, SubmissionResponse } from "@/types/submission";
import useFollowUpStore from "store/store";
import MarkAsCompleted from "../markascomplete";
import { DateRangeColumnFilter } from "../filterui/datefilter";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useUserStore } from "store/userstore";

export const embassycolumns: ColumnDef<EmbassySubmission>[] = [
   ...(BaseColumns as ColumnDef<EmbassySubmission>[]),
   {
    accessorKey: 'embassy',
    header: ({ column }) => {
        return (
            <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Embassy
                <ArrowUpDown className='w-5 h-5' />
            </Button>
        )
    },
   },

    {
        accessorKey: 'registeredDate',
        header: ({ column }) => {
            return (
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Registered Date
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        },
        cell: (props) => (
            <span className="text-gray-800">{new Date(props.getValue() as string).toDateString()}</span>
        ),
        filterFn: "dateRange",
        meta:{
            filter: DateRangeColumnFilter
        },
        enableColumnFilter: true
    },
    
    {
        header: 'Detail',
        cell: ({ row }) => {
            return (
                <SubmissionDetail entry_id={parseInt(row.getValue('entry_id'))} submissionType="embassy" />
            )
        }
    },

    {
        header: 'Actions ',
        cell: ({ row }) => {
            const [open, setOpen] = useState(false)
            const {initialFollowUp} = useFollowUpStore();
            const auth = useAuth()
            const {user} = useUserStore();
            const queryClient = useQueryClient();
            const entryId = row.getValue('entry_id') as number;
            const { data, isLoading, refetch } = useQuery({
                queryKey: ['followup', row.getValue('entry_id')],
                queryFn: async () => {
                    const res = await axiosInstance.get<response<FollowUpListType>>(`/submission/followup?entry_id=${row.getValue('entry_id')}`, {
                        headers: {
                            'Authorization': 'Bearer ' + auth?.token
                        }
                    });
                    if(res.data.data){
                        initialFollowUp(res?.data?.data, entryId)

                    }
                    return res.data;
                },
                retry: 3

            });

            const { mutate } = useMutation({
                mutationFn: async () => {
                    const response = await axiosInstance.delete(`/register/submission/embassy/${row.getValue('entry_id')}`, {
                        headers: {
                            Authorization: `Bearer ${auth?.token}`
                        }
                    });
                    return response.data;
                },
                onSuccess: () => {
                    toast.success('Submission deleted successfully');
                    queryClient.invalidateQueries({ queryKey: ['submissions'] });
                },
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        toast.error(error.response?.data.message);
                    }
                }
            });

            const handleDelete = () => {
                mutate();
            }
          
            
            return (
                <>
                    <Dialog onOpenChange={(open) => setOpen(open)} open={open}>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <div className="flex items-center">
                                    {isLoading ? <Loading /> : <MoreVertical />}
                                    <MarkAsCompleted entryId={row.getValue('entry_id')}/>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <DialogTrigger asChild>
                                        <Button variant='ghost'>
                                            <Plus className="w-5 h-5" />
                                            Followup

                                        </Button>
                                    </DialogTrigger>
                                </DropdownMenuItem>
                                {user.role === 3 && <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <DeleteConfirmationDialog onDelete={handleDelete} />
                                </DropdownMenuItem>}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {!isLoading && <FollowUp entryId={row.getValue('entry_id')} clientName={row.getValue('fullName')} open={open} initalFollowUp={data?.data}/>}
                    </Dialog>
                </>
            )
        }
    }
]