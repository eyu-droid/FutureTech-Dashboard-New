import type { MessageColumn } from "@/types/message";
import type { ColumnDef } from "@tanstack/react-table";
import { BaseColumns } from "./basecolumns";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { DateRangeColumnFilter } from "../filterui/datefilter";

export const messageColumns: ColumnDef<MessageColumn>[]=[
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
        accessorKey: 'id',
        header: 'ID'
    },
    {
        accessorKey: 'title',
        header:'Subject'

    },
    {
        accessorKey: 'body',
        header: 'Message',
        cell:(props)=>{
            const value = props.getValue() as string;
            return(
                <p className="overflow-hidden text-ellipsis whitespace-nowrap max-w-28 ">{value}</p>
            )

        }
    },
    {
        accessorKey: 'reciver',
        header: 'Mailed To'
    },
    {
        accessorKey: 'sentAt',
        header: ({column})=>{
            return(
                <Button variant='ghost' onClick={()=>column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Sent Date
                    <ArrowUpDown className="w-5 h-5"/>
                </Button>
            )
        },
        cell: (props)=>{

            return(
                <span className="text-zinc-500">{new Date(props.getValue() as string).toLocaleString()}</span>
            )
        },
        filterFn:'dateRange',
        meta:{
            filter: DateRangeColumnFilter
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: (props)=>{
            const value = props.getValue() as string
            return(
                <Badge variant='outline' className={cn('bg-blue-500 text-white', {'bg-red-500': props.getValue() as string === 'Failed', 'bg-teal-500': value === 'Completed'})}>{value}</Badge>
            )
        }
    },
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({row})=>{
            
        }
    }
]