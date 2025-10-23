import type { personalDetail } from "@/types/submission";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

export const BaseColumns:ColumnDef<personalDetail>[] = [
    {
        accessorKey: 'Select',
        header: ({table})=>{
            
            return(
            <Checkbox 
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={(value)=>{
                table.toggleAllRowsSelected(!!value)
            }
            }
            
            />
        )},
        cell: ({row})=>(
            <Checkbox 
            checked={row.getIsSelected()}
            onCheckedChange={(value)=>{
                row.toggleSelected(!!value)
            }
            }
            />
        ),
        enableSorting: false,
        enableColumnFilter: false
    },
    {
        accessorKey: 'entry_id',
        header: ({column})=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={()=>column.toggleSorting(column.getIsSorted() === "asc")}>
                    ID
                    <ArrowUpDown className='w-5 h-5'/>
                </Button>
            )
        },
    },
    {
        accessorKey: 'fullName',
        header: ({column})=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={()=>column.toggleSorting(column.getIsSorted() === "asc")}>
                    Full Name
                    <ArrowUpDown className='w-5 h-5'/>
                </Button>
            )
        }
    },
    {
        accessorKey: 'email',
        header: ({column})=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={()=>column.toggleSorting(column.getIsSorted() === "asc")}>
                    Email
                    <ArrowUpDown className='w-5 h-5'/>
                </Button>
            )
        },
        
    },
    {
        accessorKey: 'phoneNo',
        header: 'Phone Number'
    }
]