import type { LocalCompanySubmission, StartupSubmissions } from "@/types/submission"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "../ui/button"
import { ArrowUpDown, MoreVertical, Plus } from "lucide-react"
import SubmissionDetail from "@/components/submissiondetails/submissionDetails"
import { useState } from "react"
import useFollowUpStore from "store/store"
import { useAuth } from "../authprovider"
import { useQuery } from "@tanstack/react-query"
import type { response } from "@/types/response"
import type { FollowUpListType } from "@/types/followup"
import axiosInstance from "@/lib/axiosinstance"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import Loading from "../loading"
import { Badge } from "../ui/badge"
import FollowUp from "../followup"
import MarkAsCompleted from "../markascomplete"
import { DateRangeColumnFilter } from "../filterui/datefilter"
import { BaseColumns } from "./basecolumns"
import { StageColumnFilter } from "@/components/filterui/stagefilter"
import { BoothColumnFilter } from "@/components/filterui/filterbooth"

export const startupcolumns: ColumnDef<StartupSubmissions>[] = [
    ...(BaseColumns as ColumnDef<StartupSubmissions>[]),
    {
        accessorKey: 'startupName',
        header: ({ column }) => {
            return (
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Startup name
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        }
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
        filterFn: 'dateRange',
        meta:{
            filter: DateRangeColumnFilter
        }
    },
    {
        accessorKey: 'stage',
        header: ({ column }) => {
            return (
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Stage
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        },
        
        filterFn: 'stage',
        meta:{
            filter: StageColumnFilter
        }
    },
    {
        accessorKey: 'booth',
        header: ({ column }) => {
            return (
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Booth
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        },
        cell: (props)=>{
            const value = props.getValue();
            return !value? 'Yes':value
        },
        filterFn: 'booth',
        meta:{
            filter: BoothColumnFilter
        }
        
       
    },
    
    {
        header: 'Detail',
        cell: ({ row }) => {
            return (
                <SubmissionDetail entry_id={parseInt(row.getValue('entry_id'))} submissionType="startup" />
            )
        }
    },

    {
        header: 'Actions ',
        cell: ({ row }) => {
            const [open, setOpen] = useState(false)
            const {initialFollowUp} = useFollowUpStore();
            const auth = useAuth()
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
                                <DropdownMenuItem>
                                    <DialogTrigger>
                                        <Button variant='ghost'>
                                            <Plus className="w-5 h-5" />
                                            Followup

                                        </Button>
                                    </DialogTrigger>
                                </DropdownMenuItem>
                                <DropdownMenuItem>

                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {!isLoading && <FollowUp entryId={row.getValue('entry_id')} clientName={row.getValue('fullName')} open={open} initalFollowUp={data?.data}/>}
                    </Dialog>
                </>
            )
        }
    }
]