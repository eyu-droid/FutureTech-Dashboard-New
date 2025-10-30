import type { ColumnDef } from "@tanstack/react-table";

export interface MenuColumnsType{
    id: number;
    menuName:string;
    parent:number;
    createdDate:Date;

}
export const MenuColumns: ColumnDef<MenuColumnsType>[]= [
    {
        accessorKey:'id',
        header: 'ID'
    },
    {
        accessorKey: 'menuName',
        header: 'Menu',
    },
    {
        accessorKey: 'createdDate',
        header: 'Created Date'
    }
]

export type MenuType = Omit<MenuColumnsType, 'parent' | 'createdDate'>