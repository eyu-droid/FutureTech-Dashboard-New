import type { LocalCompanySubmission, Partners } from "@/types/submission";
import type { ColumnDef } from "@tanstack/react-table";
import { BaseColumns } from "./basecolumns";
import { Button } from "../ui/button";
import { ArrowDownUp } from "lucide-react";
import { DropdownMenu } from "../ui/dropdown-menu";

const baseColDef = [...BaseColumns as ColumnDef<Partners>[]];

export const partnerColumn: ColumnDef<Partners>[] = [
    ...(BaseColumns as ColumnDef<Partners>[]),
    
    {
        accessorKey: 'companyName',
        header:({column})=>{
            return(
                <Button variant='ghost' onClick={()=>column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Company Name
                    <ArrowDownUp className="w-5 h-5"/>
                </Button>
            )
        }
    },
    {
        accessorKey: 'action',
        header:'Action',
    }
    
]