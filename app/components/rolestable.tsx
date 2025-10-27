import { type RoleResponse } from "./tablecolumns/rolecolumn"
import { DataTable } from "./datatable"
import type { FC } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import CreateRoleForm from "./createRoleForm"
import DeleteRoleForm from "./deleteRoleForm"



type RoleTableProps = {
    data: RoleResponse[] | undefined;
    columns: ColumnDef<RoleResponse>[]
}
const RolesTable: FC<RoleTableProps> = ({ data, columns }) => {

    return (
        <div>
            <div className="flex justify-end gap-4 py-4">
                <CreateRoleForm />
                <DeleteRoleForm />
            </div>
            {data && <DataTable columns={columns} data={data} showGlobalFilter={false} />}

        </div>
    )
}

export default RolesTable;
