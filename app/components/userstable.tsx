import { type UserResponse } from "@/types/user"
import { DataTable } from "./datatable"
import type { FC } from "react"
import type { ColumnDef } from "@tanstack/react-table"



type UserTableProps = {
    userData: UserResponse[] | undefined;
    columns: ColumnDef<UserResponse>[]
}
const UsersTable: FC<UserTableProps> = ({ userData, columns }) => {

    return (
        <div>

            {userData && <DataTable columns={columns} data={userData} />}

        </div>
    )
}

export default UsersTable;