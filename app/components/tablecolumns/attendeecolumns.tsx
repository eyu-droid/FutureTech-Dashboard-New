import type { AttendeeResponse } from '@/types/attendee';
import {type ColumnDef} from '@tanstack/react-table';
import { Button } from '../ui/button';
import { ArrowUpDown } from 'lucide-react';

export const columns:ColumnDef<AttendeeResponse>[] = [
    {
        accessorKey: 'id',
        header: 'Id'
    },
    {
        accessorKey: 'fullname',
        header: 'Full Name',
    },
    {
        accessorKey: 'email',
        header: ({column})=>{
            return (
                <Button variant='ghost' className='cursor-pointer' onClick={()=>column.toggleSorting(column.getIsSorted() === "asc")}>
                    Email 
                    <ArrowUpDown className='w-5 h-5'/>
                </Button>
            )
        },

    },
    {
        accessorKey: 'phone',
        header: 'Phone number'
    },
    
    {
        accessorKey: 'status',
        header:'Status',
        
    },
]

