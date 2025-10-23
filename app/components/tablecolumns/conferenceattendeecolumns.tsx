import type { ConferenceAttendeeSubmission } from "@/types/submission";
import type { ColumnDef } from "@tanstack/react-table";
import { BaseColumns } from "./basecolumns";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { InterestColumnFilter } from "@/components/filterui/interestcolumnfilter";
import { ProfessionColumnFilter } from "@/components/filterui/professioncolumnfilter";

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
            )},
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
    


    

]