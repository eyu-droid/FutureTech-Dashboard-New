import axiosInstance from "@/lib/axiosinstance"
import { type AttendeeResponse } from "@/types/attendee"
import { type response } from "@/types/response"
import { useQuery } from "@tanstack/react-query"
import { DataTable } from "./datatable"
import Loading from "./loading"
import type { FC } from "react"
import type { ColumnDef } from "@tanstack/react-table"



const AttendeeTable:FC<{attendeeData: AttendeeResponse[], columns:ColumnDef<AttendeeResponse>[]}> = ({attendeeData, columns})=>{
    
    return(
        <div>
            
            {attendeeData && <DataTable columns={columns} data={attendeeData}/> }
            
        </div>
    )
}

export default AttendeeTable;