import type { EventAttendeeSubmission } from "@/types/submission";
import type { ColumnDef } from "@tanstack/react-table";
import { BaseColumns } from "./basecolumns";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { DateRangeColumnFilter } from "../filterui/datefilter";
import { InterestColumnFilter } from "@/components/filterui/interestcolumnfilter";
import { useAuth } from "../authprovider";
import axiosInstance from "@/lib/axiosinstance";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useUserStore } from "store/userstore";

export const EventAttendeeColumns: ColumnDef<EventAttendeeSubmission>[] = [
    ...(BaseColumns as ColumnDef<EventAttendeeSubmission>[]),
    {
        accessorKey: 'sectorOfInterest',
        header: ({column})=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={()=>column.toggleSorting(column.getIsSorted() === "asc")}>
                    Sector of Interest
                    <ArrowUpDown className='w-5 h-5'/>
                </Button>
            )
        },
        filterFn: 'interest',
        meta: {
            filter: InterestColumnFilter
        }
    },
    {
        accessorKey: 'registeredDate',
        header: ({column})=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={()=>column.toggleSorting(column.getIsSorted() === "asc")}>
                   Registered Date
                    <ArrowUpDown className='w-5 h-5'/>
                </Button>
            )
        },
        cell: (props) => (
            <span className="text-gray-800">{new Date(props.getValue() as string).toDateString()}</span>
        ),
        filterFn: 'dateRange',
        meta:{
            filter: DateRangeColumnFilter
        }
    },
    {
        accessorKey: 'ticketType',
        header: ({column})=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={()=>column.toggleSorting(column.getIsSorted() === "asc")}>
                    Ticket Type
                    <ArrowUpDown className='w-5 h-5'/>
                </Button>
            )
        }
    },
    {
        header: 'Actions ',
        cell: ({ row }) => {
            const auth = useAuth()
            const {user} = useUserStore();
            const queryClient = useQueryClient();
            const { mutate } = useMutation({
                mutationFn: async () => {
                    const response = await axiosInstance.delete(`/register/submission/event/${row.getValue('entry_id')}`, {
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
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {user.role === 3 && <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <DeleteConfirmationDialog onDelete={handleDelete} />
                            </DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )
        }
    }
]