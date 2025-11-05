import type { ConferenceAttendeeSubmission } from "@/types/submission";
import type { ColumnDef } from "@tanstack/react-table";
import { BaseColumns } from "./basecolumns";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { InterestColumnFilter } from "@/components/filterui/interestcolumnfilter";
import { ProfessionColumnFilter } from "@/components/filterui/professioncolumnfilter";
import { useAuth } from "../authprovider";
import axiosInstance from "@/lib/axiosinstance";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const ConferenceAttendeeColumns: ColumnDef<ConferenceAttendeeSubmission>[] = [
    ...(BaseColumns as ColumnDef<ConferenceAttendeeSubmission>[]),
    {
        accessorKey: 'investmentOpportunity',
        header: ({ column }) => {
            return (
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Want Investement Opportunity
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        }
    },
    {
        accessorKey: 'profession',
        //accessorFn: row => row.profession==='Other'? row.other:row.profession,
        header: ({ column, table }) => {
            
            return (
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Profession
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        },
        filterFn: 'profession',
        meta: {
            filter: ProfessionColumnFilter
        }
    },
    {
        accessorKey: 'sectorOfInterest',
        header: ({ column })=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Sector of Interest
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        },
        filterFn: 'interest',
        meta: {
            filter: InterestColumnFilter
        }
    },
    {
        accessorKey: 'workshop',
        header: ({ column })=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Attend Workshop
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        }
    },
    {
        accessorKey: 'ticketType',

        header: ({ column })=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Ticket Type
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        }
    },
    {
        header: 'Actions ',
        cell: ({ row }) => {
            const auth = useAuth()
            const queryClient = useQueryClient();
            const { mutate } = useMutation({
                mutationFn: async () => {
                    const response = await axiosInstance.delete(`/register/submission/conference/${row.getValue('entry_id')}`, {
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
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <DeleteConfirmationDialog onDelete={handleDelete} />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )
        }
    }
]