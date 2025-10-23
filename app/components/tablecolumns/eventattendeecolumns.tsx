import type { EventAttendeeSubmission } from "@/types/submission";
import type { ColumnDef } from "@tanstack/react-table";
import { BaseColumns } from "./basecolumns";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { DateRangeColumnFilter } from "../filterui/datefilter";
import { InterestColumnFilter } from "@/components/filterui/interestcolumnfilter";

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
    }
]