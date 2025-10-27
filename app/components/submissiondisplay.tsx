import type { ColumnDef } from "@tanstack/react-table";
import type { FC } from "react";
import Loading from "./loading";
import { DataTable } from "./datatable";

type SubmissionDetailProps = {
    name: string;
    isLoading: boolean;
    data: any;
    columns: ColumnDef<any>[];
}
const SubmissionDetail:FC<SubmissionDetailProps> = ({isLoading, name, data, columns})=>{
    return(
        <div>
            <div className="space-y-3">
                <h3 className="font-semibold md:text-2xl text-center md:text-left">{name}</h3>
                
                {
                    isLoading && <Loading/>
                }
                {
                    data && <DataTable data={data} columns={columns} showActions={true}/>
                }
            </div>

        </div>
    )
}

export default SubmissionDetail